import { useSortStore } from '@/stores/sort'

export type SortKey = 'createdAt' | 'liked' | 'views'

export interface SortOption {
    key: SortKey
    label: string
    desc: boolean
}

export const useSort = () => {
    const sortStore = useSortStore()

    return {
        currentSort: sortStore.currentSort,
        sortOptions: sortStore.sortOptions,
        setSort: sortStore.setSort,
        setSortDesc: sortStore.setSortDesc,
        compareByKey: sortStore.compareByKey
    }
}
