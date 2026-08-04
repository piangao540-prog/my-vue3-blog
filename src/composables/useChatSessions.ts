import { ref, computed } from 'vue'

export interface ChatSession {
    id: string
    title: string
    messages: { role: string; content: string }[]
    createdAt: number
}

const STORAGE_KEY = 'chat-sessions'

export const useChatSessions = () => {
    const sessions = ref<ChatSession[]>([])
    const currentSessionId = ref<string | null>(null)

    // 当前会话消息
    const currentMessages = computed(() => {
        const session = sessions.value.find(s => s.id === currentSessionId.value)
        return session ? session.messages : []
    })

    //从localstorage加载
    const loadSessions = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            if (data) {
                const parsed = JSON.parse(data)
                // 校验：必须是数组，且每项有id和messages
                if (Array.isArray(parsed)) {
                    sessions.value = parsed.filter(s => s && s.id && Array.isArray(s.messages))
                    currentSessionId.value = sessions.value[0]?.id || null
                }
            }
        } catch {
            sessions.value = []
            currentSessionId.value = null
            localStorage.removeItem(STORAGE_KEY)
        }

    }

    //保存到locastorage
    const saveSessions = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
    }

    // 新建会话
    const createSession = () => {
        const session: ChatSession = {
            id: Date.now().toString(),
            title: '新对话',
            messages: [],
            createdAt: Date.now()
        }
        sessions.value.push(session)
        currentSessionId.value = session.id
        saveSessions()
    }

    // 添加消息到当前对话
    const addMessage = (role: string, content: string) => {
        const session = sessions.value.find(s => s.id === currentSessionId.value)
        if (session) {
            session.messages.push({ role, content })
            if (role === 'user' && session.title === '新对话') {
                session.title = content.slice(0, 20)
            }
            saveSessions()
        }
    }

    // 删除会话
    const deleteSession = (id: string) => {
        sessions.value = sessions.value.filter(s => s.id !== id)
        if (currentSessionId.value === id) {
            currentSessionId.value = sessions.value[0]?.id || null
        }
        saveSessions()
    }

    // 切换会话
    const switchSession = (id: string) => {
        currentSessionId.value = id
    }

    return {
        sessions,
        currentSessionId,
        currentMessages,
        loadSessions,
        saveSessions,
        createSession,
        switchSession,
        deleteSession,
        addMessage
    }
}