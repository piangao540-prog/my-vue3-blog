import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useInterviewFilter } from './useInterviewFilter'
import type { Interview } from '@/stores/interview'

const makeInterview = (over: Partial<Interview>): Interview => ({
  id: 1,
  company: '某大厂',
  position: '前端开发',
  result: 'ongoing',
  interview_date: '2026-09-10',
  tags: [],
  views: 0,
  createdAt: '2026-09-10',
  ...over,
})

const makeSource = () =>
  ref<Interview[]>([
    makeInterview({
      id: 1,
      company: '某电商大厂',
      result: 'offer',
      interview_date: '2026-09-10',
      tags: ['Vue', '工程化'],
    }),
    makeInterview({
      id: 2,
      company: '某中厂',
      result: 'rejected',
      interview_date: '2026-03-02',
      tags: ['Vue'],
    }),
    makeInterview({
      id: 3,
      company: '某创业公司',
      result: 'ongoing',
      interview_date: '2025-11-20',
      tags: ['算法'],
    }),
    // 没有面试日期的记录，不该被任何年份筛选选中
    makeInterview({ id: 4, company: '某外企', result: 'offer', interview_date: null, tags: [] }),
  ])

describe('useInterviewFilter', () => {
  it('不设条件时返回全部', () => {
    const { filteredInterviews } = useInterviewFilter(makeSource())
    expect(filteredInterviews.value).toHaveLength(4)
  })

  it('按结果筛选', () => {
    const { resultFilter, filteredInterviews } = useInterviewFilter(makeSource())
    resultFilter.value = 'offer'
    expect(filteredInterviews.value.map((i) => i.id)).toEqual([1, 4])
  })

  it('按年份筛选，无日期的记录不入选', () => {
    const { yearFilter, filteredInterviews } = useInterviewFilter(makeSource())
    yearFilter.value = '2026'
    expect(filteredInterviews.value.map((i) => i.id)).toEqual([1, 2])
  })

  it('按标签筛选', () => {
    const { tagFilter, filteredInterviews } = useInterviewFilter(makeSource())
    tagFilter.value = 'Vue'
    expect(filteredInterviews.value.map((i) => i.id)).toEqual([1, 2])
  })

  it('多个条件是且的关系', () => {
    const { resultFilter, yearFilter, tagFilter, filteredInterviews } = useInterviewFilter(
      makeSource(),
    )
    resultFilter.value = 'offer'
    yearFilter.value = '2026'
    tagFilter.value = '工程化'
    expect(filteredInterviews.value.map((i) => i.id)).toEqual([1])
  })

  it('清空筛选条件后恢复全部', () => {
    const { resultFilter, filteredInterviews } = useInterviewFilter(makeSource())
    resultFilter.value = 'offer'
    expect(filteredInterviews.value).toHaveLength(2)
    resultFilter.value = ''
    expect(filteredInterviews.value).toHaveLength(4)
  })

  it('allYears 去重并按从新到旧排列', () => {
    const { allYears } = useInterviewFilter(makeSource())
    expect(allYears.value).toEqual(['2026', '2025'])
  })

  it('allTags 去重并排序', () => {
    const { allTags } = useInterviewFilter(makeSource())
    expect(allTags.value).toEqual(['Vue', '工程化', '算法'])
  })

  it('数据源变化时筛选结果跟着更新', () => {
    const source = makeSource()
    const { tagFilter, filteredInterviews } = useInterviewFilter(source)
    tagFilter.value = 'React'
    expect(filteredInterviews.value).toHaveLength(0)

    source.value = [...source.value, makeInterview({ id: 5, tags: ['React'] })]
    expect(filteredInterviews.value.map((i) => i.id)).toEqual([5])
  })
})
