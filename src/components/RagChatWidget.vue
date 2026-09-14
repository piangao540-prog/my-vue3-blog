<template>
  <!-- 浮动的按钮 -->
  <button class="chat-float-btn" @click="show = !show">
    <el-icon :size="20"><ChatDotRound /></el-icon>
  </button>
  <!-- 聊天对话框 -->
  <div v-if="show" class="chat-dialog">
    <div class="chat-header">
      <span class="header-title">AI助手</span>
      <div class="header-actions">
        <el-button size="small" type="primary" :icon="Plus" @click="handleCreateSession"
          >新对话</el-button
        >
        <el-button size="small" :icon="Delete" @click="clearChat">清空</el-button>
      </div>
    </div>
    <!-- 会话列表（可折叠） -->
    <el-scrollbar class="session-scroll" v-if="sessions.length > 1">
      <div class="session-list">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: session.id === currentSessionId }"
          @click="switchSession(session.id)"
        >
          <el-icon class="session-icon"><Document /></el-icon>
          <span class="session-title">{{ session.title }}</span>
          <el-icon class="session-delete" @click.stop="deleteSession(session.id)">
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>
    <div ref="chatBody" class="chat-body">
      <div v-for="(msg, i) in currentMessages" :key="i" :class="msg.role">
        <span v-html="renderMarkdown(msg.content)"></span>
      </div>
      <div v-if="loading && status === 'thinking'" class="typing">AI 正在思考...</div>
    </div>
    <div class="chat-footer">
      <el-input
        v-model="input"
        placeholder="请输入问题..."
        @keyup.enter="send"
        :disabled="loading"
      />
      <el-button v-if="loading" type="danger" @click="stopGeneration">停止</el-button>
      <el-button v-else type="primary" @click="send">发送</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getChat as chat } from '@/api/ai'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { useChatSessions } from '@/composables/useChatSessions'
import { ChatDotRound, Delete, Plus, Document, Close } from '@element-plus/icons-vue'

const show = ref(false)
const input = ref('')
const loading = ref(false)
const status = ref<'idle' | 'thinking' | 'answering' | 'done' | 'error' | 'stopped'>('idle')
const chatBody = ref<HTMLElement | null>(null)
let abortController: AbortController | null = null

// 流式文本缓冲
let streamText = ''
let rafId: number | null = null

// 将缓冲内容写进最后一条assistant消息
const writeAssistant = () => {
  const last = currentMessages.value[currentMessages.value.length - 1]
  if (last) last.content = streamText
}

// 立即冲刷
const flushStreamText = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  writeAssistant()
}

// 收到流式片段：只更新缓冲，并确保每帧最多排一次刷新
const applyStreamText = (partial: string) => {
  status.value = 'answering'
  streamText = partial
  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      rafId = null
      writeAssistant()
    })
  }
}

// 会话管理
const {
  sessions,
  currentSessionId,
  currentMessages,
  loadSessions,
  saveSessions,
  createSession,
  switchSession,
  deleteSession,
  addMessage,
} = useChatSessions()

// 开启代码高亮
const renderer = new marked.Renderer()
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}

marked.use({ renderer })

// 新建会话（等待服务端创建完成）
const handleCreateSession = async () => {
  await createSession()
}

// 发送消息
const send = async () => {
  const text = input.value.trim()
  if (!text || loading.value) return

  if (!currentSessionId.value) {
    await createSession()
  }

  addMessage('user', text)
  input.value = ''
  loading.value = true

  // 空消息占位（assistant）
  addMessage('assistant', '')
  const history = currentMessages.value.slice(0, -2)

  abortController = new AbortController()

  try {
    const sessionId = currentSessionId.value ? Number(currentSessionId.value) : null
    streamText = ''
    await chat(
      text,
      history,
      sessionId,
      abortController.signal,
      applyStreamText,
      (meta) => {
        if (meta.sessionId && currentSessionId.value !== String(meta.sessionId)) {
          currentSessionId.value = String(meta.sessionId)
        }
      },
      () => {
        status.value = 'thinking'
      },
    )
    flushStreamText()
    status.value = 'done'
    // 流式结束，保存最终答案
    saveSessions()
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      // 用户主动停止：把已收到的部分内容展示出来
      flushStreamText()
      return
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    status.value = 'error'
    currentMessages.value[currentMessages.value.length - 1].content = '请求失败，请重新尝试'
    saveSessions()
  } finally {
    loading.value = false
    abortController = null
  }
}

// 判断是否贴近底部
const isNearBottom = () => {
  const el = chatBody.value
  if (!el) return false
  return el.scrollHeight - el.scrollTop - el.clientHeight < 60
}

watch(
  currentMessages,
  () => {
    if (!isNearBottom()) return
    setTimeout(() => {
      if (chatBody.value) {
        chatBody.value.scrollTop = chatBody.value.scrollHeight
      }
    }, 50)
  },
  { deep: true },
)

const clearChat = () => {
  if (currentSessionId.value) {
    deleteSession(currentSessionId.value)
  }
}

const stopGeneration = () => {
  abortController?.abort()
  abortController = null
  loading.value = false
}

// markdown转换为HTML
const renderMarkdown = (content: string) => {
  const openCount = (content.match(/```/g) || []).length
  let safe = content
  if (openCount % 2 !== 0) {
    safe = content + '\n```'
  }
  return marked.parse(safe)
}

onMounted(() => loadSessions())
</script>

<style scoped>
.chat-float-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #409eff;
  color: white;
  font-size: 20px;
  cursor: pointer;
  z-index: 999;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.chat-dialog {
  position: fixed;
  bottom: 84px;
  right: 24px;
  width: 360px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 999;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-anchor: none;
}

/* 会话列表 */
.session-scroll {
  max-height: 200px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.session-list {
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.session-item:hover {
  background: #f0f2f5;
}

.session-item.active {
  background: #e6f0ff;
}

.session-icon {
  flex-shrink: 0;
  color: #666;
}

.session-title {
  flex: 1;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-delete {
  flex-shrink: 0;
  color: #ccc;
  cursor: pointer;
}

.session-delete:hover {
  color: #f56c6c;
}

.user,
.assistant {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 8px;
  line-height: 1.5;
  word-break: break-word;
}

.user {
  align-self: flex-end;
  background: #409eff;
  color: white;
}

.assistant {
  align-self: flex-start;
  background: #f0f2f5;
  color: #333;
}

.chat-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}

.chat-footer input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

.chat-footer button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #409eff;
  color: white;
  cursor: pointer;
}

.typing {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f0f2f5;
  color: #999;
  font-size: 13px;
}

.typing::after {
  content: '...';
  animation: dots 1.5s steps(3, end) infinite;
}

.assistant pre {
  background: #f8f8f8;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  max-width: 100%;
}

.assistant code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.assistant p {
  margin: 6px 0;
}

.assistant ul,
.assistant ol {
  padding-left: 20px;
  margin: 6px 0;
}

@keyframes dots {
  0% {
    content: '.';
  }
  33% {
    content: '..';
  }
  66% {
    content: '...';
  }
}

@media (max-width: 480px) {
  .chat-dialog {
    right: 8px;
    width: calc(100% - 16px);
    height: 60vh;
  }
}
</style>
