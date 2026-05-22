import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
    const searchKeyword = ref('')
    const selectedTag = ref('')
    // 分类选择
    const selectedCategory = ref('')

    const setSearchKeyword = (keyword: string) => {
        searchKeyword.value = keyword
    }
    const setSelectedTag = (tag: string) => {
        selectedTag.value = tag
    }
    const clearSearch = () => {
        searchKeyword.value = ''
        selectedTag.value = ''
        selectedCategory.value = ''
    }

    const setSelectedCategory = (category: string) => {
        selectedCategory.value = category
    }

    const toggleTag = (tag: string) => {
        if (selectedTag.value === tag) {
            selectedTag.value = ''
        } else {
            selectedTag.value = tag
        }
    }

    return {
        searchKeyword, selectedTag, setSearchKeyword, setSelectedCategory,
        setSelectedTag, clearSearch, toggleTag, selectedCategory
    }
})