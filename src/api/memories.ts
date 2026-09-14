import axios from './axios'

export interface MemoryItem {
  id: number
  category: string
  content: string
  weight: number | string
  source_message_id: number | null
  createdAt: string
  updatedAt: string
}

// 获取当前用户的记忆列表
export const getMemories = async (): Promise<MemoryItem[]> => {
  const { data } = await axios.get('/memories')
  return data
}

// 手动新增一条记忆
export const createMemory = async (payload: {
  category: string
  content: string
  weight: number
}): Promise<MemoryItem> => {
  const { data } = await axios.post('/memories', payload)
  return data
}

// 编辑一条记忆
export const updateMemory = async (
  id: number,
  payload: { category?: string; content?: string; weight?: number },
): Promise<MemoryItem> => {
  const { data } = await axios.put(`/memories/${id}`, payload)
  return data
}

// 删除一条记忆（后端软删除）
export const deleteMemory = async (id: number): Promise<void> => {
  await axios.delete(`/memories/${id}`)
}

// 生成/获取某个周期的复盘（refresh=true 时强制重新生成）
export const getReview = async (
  period: string,
  refresh = false,
): Promise<{ period: string; content: string; cached: boolean }> => {
  const { data } = await axios.get('/memory/review', {
    params: { period, refresh: refresh ? 1 : undefined },
  })
  return data
}

// 一键重置记忆库（后端软删除记忆，保留原始对话）
export const resetMemories = async (): Promise<void> => {
  await axios.post('/memory/reset')
}
