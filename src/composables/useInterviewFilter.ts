import { computed, ref, type Ref } from 'vue'
import type { Interview, InterviewResult } from '@/stores/interview'

// 面试日期在库里是 DATE，拿回来可能是字符串也可能是 Date，统一取年份
const getYear = (date: string | Date | null | undefined): string => {
  if (!date) return ''
  const parsed = date instanceof Date ? date : new Date(date)
  return Number.isNaN(parsed.getTime()) ? '' : String(parsed.getFullYear())
}

/**
 * 面经的三个筛选维度：结果 / 年份 / 标签。
 *
 * 筛选状态刻意放在这里而不是 useSearchStore —— 后者是模块级全局单例，
 * 面经的筛选条件会串到文章列表上去。放在这里同时也让它能脱离 store 单测。
 */
export const useInterviewFilter = (source: Ref<Interview[]>) => {
  const resultFilter = ref<InterviewResult | ''>('')
  const yearFilter = ref('')
  const tagFilter = ref('')

  const filteredInterviews = computed(() => {
    let list = source.value
    if (resultFilter.value) {
      list = list.filter((item) => item.result === resultFilter.value)
    }
    if (yearFilter.value) {
      list = list.filter((item) => getYear(item.interview_date) === yearFilter.value)
    }
    if (tagFilter.value) {
      list = list.filter((item) => item.tags.includes(tagFilter.value))
    }
    return list
  })

  const allTags = computed(() => {
    const tags = new Set<string>()
    source.value.forEach((item) => item.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  })

  const allYears = computed(() => {
    const years = new Set<string>()
    source.value.forEach((item) => {
      const year = getYear(item.interview_date)
      if (year) years.add(year)
    })
    return Array.from(years).sort().reverse()
  })

  return { resultFilter, yearFilter, tagFilter, filteredInterviews, allTags, allYears }
}
