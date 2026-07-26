<template>
    <!-- 浮动的按钮 -->
    <button class="chat-float-btn" @click="show = !show">AI</button>
    <!-- 聊天对话框 -->
    <div v-if="show" class="chat-dialog">
        <div class="chat-header">
            <span>AI助手</span>
            <button @click="clearChat">清空</button>
        </div>
        <div class="chat-body">
            <div v-for="(msg, i) in messages" :key="i" :class="msg.role">
                {{ msg.content }}
            </div>
        </div>
        <div class="chat-footer">
            <input v-model="input" @keyup.enter="send" placeholder="请输入问题..."/>
            <button @click="send">发送</button>
        </div>
    </div>
</template>


<script setup lang="ts">
import {ref} from 'vue'
import {getChat as chat} from '@/api/ai'

const show = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref<{role:string;content:string}[]>([])

// 发送消息
const send = async() => {
    const text = input.value.trim()
    if(!text || loading.value) return 

    messages.value.push({role:'user',content:text})
    input.value = ''
    loading.value = true
    try{
        const answer = await chat(text)
        messages.value.push({role:'assistant',content:answer})
    }catch{
        messages.value.push({role:'assistant',content: '请求失败，请重新尝试'})
    } finally{
        loading.value = false
    }
}

const clearChat = () => {
    messages.value = []
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

@media (max-width: 480px) {
    .chat-dialog {
        right: 8px;
        width: calc(100% - 16px);
        height: 60vh;
    }
}
</style>