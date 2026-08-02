<template>
    <!-- 浮动的按钮 -->
    <button class="chat-float-btn" @click="show = !show">AI</button>
    <!-- 聊天对话框 -->
    <div v-if="show" class="chat-dialog">
        <div class="chat-header">
            <span>AI助手</span>
            <button @click="clearChat">清空</button>
        </div>
        <div ref="chatBody" class="chat-body">
            <div v-for="(msg, i) in messages" :key="i" :class="msg.role">
                <span v-html="renderMarkdown(msg.content)"></span>
            </div>
            <div v-if="loading" class="typing">AI 正在输入...</div>
        </div>
        <div class="chat-footer">
            <input v-model="input" @keyup.enter="send" placeholder="请输入问题..."/>
            <button v-if="loading" @click="stopGeneration" style="color: red;">停止</button>
            <button @click="send">发送</button>
        </div>
    </div>
</template>


<script setup lang="ts">
import {ref,watch} from 'vue'
import {getChat as chat} from '@/api/ai'
import { marked } from 'marked'
import hljs from 'highlight.js'

const show = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref<{role:string;content:string}[]>([])
const chatBody = ref<HTMLElement | null>(null)
let abortController : AbortController | null = null

// 开启代码高亮
const renderer = new marked.Renderer()
renderer.code = ({text,lang}:{text:string;lang?:string}) => {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
    const highlighted = hljs.highlight(text,{language}).value
    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}

marked.use({renderer})


// 发送消息
const send = async() => {
    const text = input.value.trim()
    if(!text || loading.value) return 

    messages.value.push({role:'user',content:text})
    input.value = ''
    loading.value = true

    // 空消息占位
    messages.value.push({role:'assistant',content:''})
    const history = messages.value.slice(0,-2)

    abortController = new AbortController()

    try{
        await chat(text,history,abortController.signal,(partial) => {
            messages.value[messages.value.length - 1].content = partial
        })
    }catch(e){
        if(e instanceof DOMException && e.name === 'AbortError') return
        messages.value[messages.value.length - 1].content = '请求失败，请重新尝试'
    } finally{
        loading.value = false
        abortController = null
    }
}

watch(messages,() => {
    setTimeout(() => {
        if(chatBody.value){
            chatBody.value.scrollTop = chatBody.value.scrollHeight
        }
    },50)
},{deep:true})

const clearChat = () => {
    messages.value = []
}

const stopGeneration = () => {
    abortController?.abort()
    abortController = null
    loading.value = false
}

// markdown转换为HTML
const renderMarkdown = (content:string) => {
    const openCount = (content.match(/```/g) || []).length
    let safe = content
    if(openCount % 2 !== 0){
        safe = content + '\n```'
    }
    return marked.parse(safe)
}
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
}

.user, .assistant {
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

.assistant ul, .assistant ol {
    padding-left: 20px;
    margin: 6px 0;
}


@keyframes dots {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
}


@media (max-width: 480px) {
    .chat-dialog {
        right: 8px;
        width: calc(100% - 16px);
        height: 60vh;
    }
}
</style>