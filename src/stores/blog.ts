import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Article {
    id: number
    title: string
    summary: string
    content: string
    createdAt: string
    tags: string[]
}

export const useBlogStore = defineStore('blog', () => {
    const articles = ref<Article[]>([
        {
            id: 1,
            title: '我的第一篇博客',
            summary: '这是博客项目的第一篇示例文章。',
            content: '这里是文章正文内容。',
            createdAt: '2026-05-09',
            tags: ['Vue3', 'Vite'],
        },
    ])


    const latestArticles = computed(() => articles.value.slice(0, 5))


    function getArticleById(id: number): Article | undefined {
        return articles.value.find((article) => article.id === id)
    }


    return { articles, latestArticles, getArticleById }
})