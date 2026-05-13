import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
    const searchKeyword = ref('')
    const selectedTag = ref('')

    const setSearchKeyword = (keyword: string) => {
        searchKeyword.value = keyword
    }
    const setSelectedTag = (tag: string) => {
        selectedTag.value = tag
    }
    const clearSearch = () => {
        searchKeyword.value = ''
        selectedTag.value = ''
    }
    const toggleTag = (tag: string) => {
        if (selectedTag.value === tag) {
            selectedTag.value = ''
        } else {
            selectedTag.value = tag
        }
    }

    return { searchKeyword, selectedTag, setSearchKeyword, setSelectedTag, clearSearch, toggleTag }
})