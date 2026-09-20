import axios from './axios'
import type { Interview, InterviewPayload, InterviewRaw } from '@/stores/interview'

// tags 在库里是 JSON 字符串，且允许为 NULL，这里统一收敛成数组
const toTagArray = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags
  if (typeof tags !== 'string' || !tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const withTags = <T extends { tags: unknown }>(row: T): T & { tags: string[] } => ({
  ...row,
  tags: toTagArray(row.tags),
})

// 获取面经列表（公开，不含真名和正文）
export const getInterviews = async (): Promise<Interview[]> => {
  const response = await axios.get('/interviews')
  return response.data.map(withTags)
}

// 获取面经详情（公开，不含真名）
export const getInterviewById = async (id: number): Promise<Interview | undefined> => {
  const response = await axios.get(`/interviews/${id}`)
  return response.data ? withTags(response.data) : undefined
}

// 获取面经原始数据（仅管理员，含真实公司名，编辑页回填用）
export const getInterviewRaw = async (id: number): Promise<InterviewRaw> => {
  const response = await axios.get(`/interviews/${id}/raw`)
  return withTags(response.data)
}

// 更新阅读量
export const incrementInterviewViews = async (id: number): Promise<void> => {
  await axios.post(`/interviews/${id}/views`)
}

// 新增面经（仅管理员）
export const createInterview = async (payload: InterviewPayload): Promise<{ id: number }> => {
  const response = await axios.post('/interviews', payload)
  return response.data
}

// 更新面经（仅管理员）
export const updateInterview = async (id: number, payload: InterviewPayload): Promise<void> => {
  await axios.put(`/interviews/${id}`, payload)
}

// 删除面经（仅管理员）
export const deleteInterview = async (id: number): Promise<void> => {
  await axios.delete(`/interviews/${id}`)
}
