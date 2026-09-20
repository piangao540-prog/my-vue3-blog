import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as interviewApi from '@/api/interview'

export type InterviewResult = 'offer' | 'rejected' | 'ongoing' | 'declined'

// 公开接口读到的面经。company 是脱敏展示名，真名不会下发到这里。
export interface Interview {
  id: number
  company: string
  position: string
  channel?: string
  result: InterviewResult
  interview_date: string | null
  tags: string[]
  questions?: string
  content?: string
  views: number
  createdAt: string
}

// 编辑页回填用，company 是真实公司名
export interface InterviewRaw extends Interview {
  company_public: string
  status: 'draft' | 'published'
}

export interface InterviewPayload {
  company: string
  company_public: string
  position: string
  channel?: string
  result: InterviewResult
  interview_date?: string | null
  tags: string[]
  questions?: string
  content?: string
  status: 'draft' | 'published'
}

export const RESULT_LABELS: Record<InterviewResult, string> = {
  offer: '已拿 offer',
  rejected: '已挂',
  ongoing: '进行中',
  declined: '已放弃',
}

export const RESULT_TAG_TYPES: Record<InterviewResult, 'success' | 'danger' | 'warning' | 'info'> = {
  offer: 'success',
  rejected: 'danger',
  ongoing: 'warning',
  declined: 'info',
}

export const RESULT_OPTIONS = (Object.keys(RESULT_LABELS) as InterviewResult[]).map((value) => ({
  value,
  label: RESULT_LABELS[value],
}))

export const useInterviewStore = defineStore('interview', () => {
  const interviews = ref<Interview[]>([])
  const loading = ref(false)

  const loadInterviews = async () => {
    loading.value = true
    try {
      interviews.value = await interviewApi.getInterviews()
    } catch (error) {
      console.error('加载面经失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 详情不走列表缓存，直接打接口，避免列表被裁剪过的字段影响详情
  const getInterviewById = async (id: number): Promise<Interview | undefined> => {
    return await interviewApi.getInterviewById(id)
  }

  return { interviews, loading, loadInterviews, getInterviewById }
})
