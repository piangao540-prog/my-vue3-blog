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

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || '请求失败')
  return { answer: data.answer || '', sessionId: data.sessionId }
}
