<template>
  <!-- 浮动的按钮 -->
  <button class="chat-float-btn" @click="show = !show">
    <el-icon :size="20"><ChatDotRound /></el-icon>
  </button>
  <!-- 聊天对话框 -->
  <div v-if="show" class="chat-dialog" :class="{ expanded }">
    <div class="chat-header">
      <span class="header-title">AI助手</span>
      <div class="header-actions">
        <el-button
          size="small"
          :icon="expanded ? ScaleToOriginal : FullScreen"
          :title="expanded ? '收起' : '放大'"
          @click="expanded = !expanded"
        />
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
        <span
          v-if="loading && status === 'thinking' && i === currentMessages.length - 1"
          class="typing"
          >AI {{ status }}</span
        >
        <span
          v-if="loading && status === 'answering' && i === currentMessages.length - 1"
          class="caret"
        ></span>
      </div>
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
import { renderMarkdown } from '@/utils/markdown'
import { useChatSessions } from '@/composables/useChatSessions'
import {
  ChatDotRound,
  Delete,
  Plus,
  Document,
  Close,
  FullScreen,
  ScaleToOriginal,
} from '@element-plus/icons-vue'
import { useStreamText } from '@/composables/useStreamText'

const show = ref(false)
const input = ref('')
const loading = ref(false)
// 回答里代码或内容较多时，可以把面板放大来看
const expanded = ref(false)
const status = ref<'idle' | 'thinking' | 'answering' | 'done' | 'stoped' | 'error'>('idle')
const chatBody = ref<HTMLElement | null>(null)
let abortController: AbortController | null = null
let streamTarget: { role: string; content: string } | null = null

// 会话管理
const {
  sessions,
  currentSessionId,
  streamingSessionId,
  currentMessages,
  loadSessions,
  saveSessions,
  createSession,
  switchSession,
  deleteSession,
  addMessage,
} = useChatSessions()

// rAF帧刷新
const {
  push: pushStream,
  flush: flushStream,
  reset: resetStream,
} = useStreamText((text) => {
  if (streamTarget) streamTarget.content = text
  status.value = 'answering'
})

// 新建会话（等待服务端创建完成）
const handleCreateSession = async () => {
  await createSession()
}

// 停止发送
const stopGeneration = () => {
  abortController?.abort()
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
  // 锁定写入目标：拿的是消息对象的引用，之后不管切到哪个会话，写的都是这一条
  streamTarget = currentMessages.value[currentMessages.value.length - 1] ?? null
  const history = currentMessages.value.slice(0, -2)

  // 清空上一轮残留的缓冲，避免上一轮的内容被冲进新气泡
  resetStream()
  status.value = 'thinking'

  abortController = new AbortController()

  streamingSessionId.value = currentSessionId.value

  try {
    const sessionId = currentSessionId.value ? Number(currentSessionId.value) : null
    const { answer, sessionId: newSessionId } = await chat(
      text,
      history,
      sessionId,
      pushStream,
      abortController.signal,
    )
    if (newSessionId && currentSessionId.value !== String(newSessionId)) {
      currentSessionId.value = String(newSessionId)
    }
    // 冲掉最后一帧，否则末尾几个字可能还没渲染就结束了
    flushStream()
    if (streamTarget) streamTarget.content = answer
    status.value = 'done'
    saveSessions()
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      flushStream()
      status.value = 'stoped'
      saveSessions()
      return
    }
    // 先取消排队中的帧，否则它会把"请求失败"覆盖成半截回答
    resetStream()
    if (streamTarget) streamTarget.content = '请求失败，请重新尝试'
    saveSessions()
    status.value = 'error'
  } finally {
    abortController = null
    streamTarget = null
    streamingSessionId.value = null
    loading.value = false
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
  /* 助手会输出代码块，面板太窄的话代码只能横向滚；
     用 min() 同时保证大屏够宽、小屏不超出视口 */
  width: min(460px, calc(100vw - 32px));
  height: min(570px, calc(100vh - 140px));
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 999;
}

/* 放大态：居中放大到接近全屏，代码和长内容不用再挤在窄面板里 */
.chat-dialog.expanded {
  width: min(960px, calc(100vw - 48px));
  height: min(88vh, 860px);
  bottom: 10px;
  right: 50%;
  transform: translateX(50%);
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

.typing {
  color: #999;
  font-size: 13px;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: currentColor;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
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
  padding: 8px 12px;
  border-radius: 8px;
  line-height: 1.5;
  word-break: break-word;
}

.user {
  align-self: flex-end;
  max-width: 80%;
  background: #409eff;
  color: white;
}

.assistant {
  align-self: flex-start;
  /* 回答经常带代码块和表格，比用户消息需要更多横向空间 */
  max-width: 94%;
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

/* v-html 注入的 DOM 不受 scoped 样式影响，必须用 :deep() 才能命中，
   否则这些规则一条都不会生效，列表和代码块会退回浏览器默认样式 */
.assistant :deep(pre) {
  background: #f8f8f8;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  max-width: 100%;
}

.assistant :deep(code) {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12.5px;
}

.assistant :deep(p) {
  margin: 6px 0;
}

/* 列表标记一律自己画。
   原因有两条：::marker 是"部分支持"的伪元素；而且浏览器 UA 样式表对嵌套列表
   有 ul ul { list-style-type: circle } 这类规则，会在第二层换成空心圆。
   全部改成自绘 + CSS 计数器，嵌套多少层表现都一致。 */
.assistant :deep(ul),
.assistant :deep(ol) {
  margin: 6px 0;
  padding-left: 1.4em;
  list-style: none;
}

/* 显式写在 li 上，防止 UA 样式表按嵌套层级接管标记 */
.assistant :deep(li) {
  position: relative;
  list-style: none;
}

/* 无序项：浅灰小圆点 */
.assistant :deep(ul) > li::before {
  content: '•';
  position: absolute;
  left: -1em;
  color: #9ca3af;
  font-size: 0.9em;
}

/* 有序项：用 CSS 计数器编号，颜色和位置可控，嵌套时会自动重新计数 */
.assistant :deep(ol) {
  counter-reset: ol-item;
}

.assistant :deep(ol) > li {
  counter-increment: ol-item;
}

.assistant :deep(ol) > li::before {
  content: counter(ol-item) '.';
  position: absolute;
  left: -1.4em;
  color: inherit;
}

@media (max-width: 480px) {
  .chat-dialog {
    right: 8px;
    bottom: 76px;
    width: calc(100% - 16px);
    height: min(70vh, calc(100vh - 120px));
  }

  .chat-dialog.expanded {
    right: 8px;
    width: calc(100% - 16px);
    /* 放大态上边距与 bottom: 10px 对称，真正接近全屏 */
    height: calc(100vh - 20px);
    transform: none;
  }
}
</style>
