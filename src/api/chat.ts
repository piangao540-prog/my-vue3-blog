import axios from "./axios"


export interface ServerSession{
    id: number
    title: string
    createdAt: string
    updatedAt: string
    messageCount?: number
}

export interface ServerMessage{
    id: number
    role: string
    content: string
    sources: {articleId?: number; title: string}[] | null
    createdAt: string
}

// 获取当前用户的会话列表
export const getSessions = async (): Promise<ServerSession[]> => {
    const {data} = await axios.get('/chat/sessions')
    return data
}

// 新建一个会话
export const createSession = async (title?: string): Promise<ServerSession> => {
    const {data} = await axios.post('/chat/sessions',{title})
    return data
}

// 获取某个会话的全部消息
export const getMessages = async (sessionId: number): Promise<ServerMessage[]> => {
    const { data } = await axios.get(`/chat/sessions/${sessionId}/messages`)
    return data
}

// 删除某个会话
export const deleteSession = async (sessionId: number): Promise<void> => {
    await axios.delete(`/chat/sessions/${sessionId}`)
}

// 导出全部会话与记忆（浏览器下载文件）
export const exportChats = async (format: 'json' | 'markdown'): Promise<void> => {
    const { data } = await axios.get('/chat/export', { params: { format }, responseType: 'blob' })
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    link.download = `memory-${ts}.${format === 'json' ? 'json' : 'md'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
