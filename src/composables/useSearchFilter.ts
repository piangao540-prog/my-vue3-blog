import { computed } from 'vue'
import { useBlogStore } from '@/stores/blog'
import { useSearchStore } from '@/stores/search'

// 关键词和标签筛选
export const useSearchFilter = () => {
    const blogStore = useBlogStore()
    const searchStore = useSearchStore()

    const filteredArticles = computed(() => {
        let articles = blogStore.latestArticles
        // 按分类筛选
        if (searchStore.selectedCategory) {
            articles = articles.filter(article =>
                article.category === searchStore.selectedCategory
            )
        }
        // 按标签筛选
        if (searchStore.selectedTag) {
            articles = articles.filter(article =>
                article.tags.includes(searchStore.selectedTag))
        }
        // 按关键词筛选（全文搜索）
        if (searchStore.searchKeyword) {
            const keyword = searchStore.searchKeyword.toLowerCase()
            articles = articles.filter(article => {
                // 标题
                const titleMatch = article.title.toLowerCase().includes(keyword)
                // 摘要
                const summaryMatch = article.summary.toLowerCase().includes(keyword)
                // 内容
                const contentText = article.content.replace(/<[^>]*>/g, '').toLowerCase()
                const contentMatch = contentText.includes(keyword)
                // 标签（some只要有一个满足就返回true）
                const tagMatch = article.tags.some(tag =>
                    tag.toLowerCase().includes(keyword)
                )
                return titleMatch || summaryMatch || contentMatch || tagMatch
            })
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

    const allCategories = () => {
        const categorise = new Set<string>()
        blogStore.articles.forEach(article => {
            if (article.category) {
                categorise.add(article.category)
            }
        })
        return Array.from(categorise)
    }
    return { filteredArticles, allTags, allCategories }
}