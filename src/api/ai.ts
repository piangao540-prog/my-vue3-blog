
export const getAiSummary = async (
  content: string,
  articleId: number,
): Promise<string> => {
  const base = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
  const response = await fetch(`${base}/api/ai/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, articleId }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || '生成摘要失败')
  return data.summary || ''
}

export const getAiTags = async (content: string, title?: string): Promise<string[]> => {
  const base = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
  const response = await fetch(`${base}/api/ai/tag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, title }),
  })
  const data = await response.json()
  return data.tags || []
}

export const getChat = async (
  question: string,
  history: { role: string; content: string }[],
  sessionId: number | null,
  onText?: (full: string) => void,
): Promise<{ answer: string; sessionId?: number }> => {
  const base = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''

  const token = localStorage.getItem('token')
  const response = await fetch(`${base}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question, history, sessionId }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || '请求失败')
  }

  // 处理后端的流式输出
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullAnswer = ''
  let finalSessionId: number | undefined

  // 把不确定性关进一个函数里
  const parseEvent = (raw: string) => {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6)
      if (raw === '[DONE]') continue
      const obj = parseEvent(raw)
      if (!obj) continue

      if (obj.error) {
        throw new Error(obj.error)
      }
      if (obj.text) {
        fullAnswer += obj.text
        onText?.(fullAnswer)
      }
      if (obj.sessionId) finalSessionId = obj.sessionId
    }
  }
  return { answer: fullAnswer || '', sessionId: finalSessionId }
}
