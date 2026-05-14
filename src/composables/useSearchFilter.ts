import { computed } from 'vue'
import { useBlogStore } from '@/stores/blog'
import { useSearchStore } from '@/stores/search'

// 关键词和标签筛选
export const useSearchFilter = () => {
    const blogStore = useBlogStore()
    const searchStore = useSearchStore()

    const filteredArticles = computed(() => {
        let articles = blogStore.latestArticles
        if (searchStore.selectedTag) {
            articles = articles.filter(article =>
                article.tags.includes(searchStore.selectedTag))
        }
        if (searchStore.searchKeyword) {
            const keyword = searchStore.searchKeyword.toLowerCase()
            articles = articles.filter(article =>
                article.title.toLowerCase().includes(keyword) ||
                article.summary.toLowerCase().includes(keyword)
            )
        }
        return articles
    })
    const allTags = computed(() => {
        const tags = new Set<string>()
        blogStore.articles.forEach(article => {
            article.tags.forEach(tag => tags.add(tag))
        })
        return Array.from(tags)
    })
    return { filteredArticles, allTags }
}