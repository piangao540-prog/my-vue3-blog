import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { articleList } from '@/data/articles'

export interface Article {
    id: number
    title: string
    summary: string
    content: string
    createdAt: string
    tags: string[]
}

export const useBlogStore = defineStore('blog', () => {
    const articles = ref<Article[]>(articleList)

    const latestArticles = computed(() => articles.value.slice(0, 5))

    const paginatedArticles = computed(() => {
        return (page: number, pageSize: number) => {
            const start = (page - 1) * pageSize
            const end = start + pageSize
            return articles.value.slice(start, end)
        }
    })

    function getArticleById(id: number): Article | undefined {
        return articles.value.find((article) => article.id === id)
    }

    function getArticlesByTag(tag: string): Article[] {
        return articles.value.filter((article) => article.tags.includes(tag))
    }

    return {
        articles,
        latestArticles,
        paginatedArticles,
        getArticleById,
        getArticlesByTag,
    }
})