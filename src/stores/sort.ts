import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SortKey = 'createdAt' | 'liked' | 'views'

export interface SortOption {
    key: SortKey
    label: string
    desc: boolean
}

export const useSortStore = defineStore('sort', () => {
    // 当前排序条件
    const currentSort = ref<SortOption>({
        key: 'createdAt',
        label: '最新时间',
        desc: true
    })

    // 可选的排序条件
    const sortOptions: SortOption[] = [
        { key: 'createdAt', label: '最新时间', desc: true },
        { key: 'views', label: '最多阅读', desc: true },
        { key: 'liked', label: '是否收藏', desc: true },
    ]

    // 设置排序条件
    const setSort = (option: SortOption) => {
        currentSort.value.key = option.key
        currentSort.value.label = option.label
        currentSort.value.desc = option.desc
    }

    // 切换排序方向
    const setSortDesc = () => {
        currentSort.value.desc = !currentSort.value.desc
    }

    // 排序比较函数
    const compareByKey = (a: any, b: any, key: SortKey): number => {
        switch (key) {
            case 'createdAt':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            case 'views':
                return a.views - b.views
            case 'liked':
                return (a.like ? 1 : 0) - (b.like ? 1 : 0)
            default:
                return 0
        }
    }

    return {
        currentSort,
        sortOptions,
        setSort,
        setSortDesc,
        compareByKey
    }
})
