import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import * as chatApi from '@/api/chat'

export interface ChatSession {
  id: string
  title: string
  messages: { role: string; content: string }[]
  createdAt: number
  messageCount?: number
}

const STORAGE_KEY = 'chat-sessions'

export const useChatSessions = () => {
  const userStore = useUserStore()
  const sessions = ref<ChatSession[]>([])
  const currentSessionId = ref<string | null>(null)
  // 正在流式输出中的会话：记住它，避免被服务端数据覆盖
  const streamingSessionId = ref<string | null>(null)

  // 新增：登录用户走服务端存储，访客走 localStorage
  const isServerMode = computed(() => !!userStore.isLoggedIn)

  // 当前会话消息
  const currentMessages = computed(() => {
    const session = sessions.value.find((s) => s.id === currentSessionId.value)
    return session ? session.messages : []
  })

  // 服务端会话映射前端
  const mapSession = (s: chatApi.ServerSession): ChatSession => ({
    id: String(s.id),
    title: s.title,
    messages: [],
    createdAt: Date.parse(s.createdAt) || Date.now(),
    messageCount: s.messageCount ?? 0,
  })

  // 服务端消息映射前端
  const mapMessage = (m: chatApi.ServerMessage) => ({
    role: m.role,
    content: m.content,
  })

  //从localstorage加载
  const loadFromLocal = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        // 校验：必须是数组，且每项有id和messages
        if (Array.isArray(parsed)) {
          sessions.value = parsed.filter((s) => s && s.id && Array.isArray(s.messages))
          currentSessionId.value = sessions.value[0]?.id || null
        }
      }
    } catch {
      sessions.value = []
      currentSessionId.value = null
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 从服务端加载会话消息
  const loadMessages = async (id: string) => {
    const session = sessions.value.find((s) => s.id === id)
    if (!session) return
    // 正在流式的会话不要重新拉取：那条回答还没落库，覆盖后界面上会"消失"，
    // 而且后续分片会写进一个已经不在数组里的对象，再也显示不出来
    if (streamingSessionId.value === id) return
    const ServerMessages = await chatApi.getMessages(Number(id))
    session.messages = ServerMessages.map(mapMessage)
  }

  // 加载会话列表
  const loadSessions = async () => {
    if (!isServerMode.value) {
      loadFromLocal()
      return
    }
    try {
      const list = await chatApi.getSessions()
      sessions.value = list.map(mapSession)
      currentSessionId.value = sessions.value[0]?.id || null
      if (currentSessionId.value) {
        await loadMessages(currentSessionId.value)
      }
    } catch {
      sessions.value = []
      currentSessionId.value = null
    }
  }

  //保存到locastorage
  const saveSessions = () => {
    if (!isServerMode.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
    }
  }

  // 新建会话
  const createSession = async () => {
    if (isServerMode.value) {
      const server = await chatApi.createSession()
      const session = mapSession(server)
      sessions.value.push(session)
      currentSessionId.value = session.id
      return session
    }
    const session: ChatSession = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
    }
    sessions.value.push(session)
    currentSessionId.value = session.id
    saveSessions()
  }

  // 添加消息到当前对话
  const addMessage = (role: string, content: string) => {
    const session = sessions.value.find((s) => s.id === currentSessionId.value)
    if (session) {
      session.messages.push({ role, content })
      if (role === 'user' && session.title === '新对话') {
        session.title = content.slice(0, 20)
      }
      saveSessions()
    }
  }

  // 删除会话
  const deleteSession = async (id: string) => {
    if (isServerMode.value) {
      await chatApi.deleteSession(Number(id))
    }
    sessions.value = sessions.value.filter((s) => s.id !== id)
    if (currentSessionId.value === id) {
      currentSessionId.value = sessions.value[0]?.id || null
    }
    saveSessions()
  }

  // 切换会话
  const switchSession = async (id: string) => {
    currentSessionId.value = id
    if (isServerMode.value) {
      await loadMessages(id)
    }
  }

  // 登录状态变化时重新加载：登录后换成数据库数据，退出后换回本地数据
  watch(isServerMode, () => {
    loadSessions()
  })

  return {
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
  }
}
