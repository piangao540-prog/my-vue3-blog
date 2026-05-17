import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as articleApi from '@/api/articles'

export interface Article {
    id: number
    title: string
    summary: string
    content: string
    createdAt: string
    sumTag: string
    tags: string[]
    views: number
    like: boolean
}

export const useBlogStore = defineStore('blog', () => {
    const articles = ref<Article[]>([])
    const loading = ref(false)
    // 初始化加载文章
    const loadArticles = async () => {
        loading.value = true
        try {
            articles.value = await articleApi.getArticles()
        } catch (error) {
            console.error('加载文章失败:', error)
        } finally {
            loading.value = false
        }
    }
    // 获取最新文章
    const latestArticles = computed(() => articles.value.slice(0, 5))
    // 分页获取文章
    const paginatedArticles = computed(() => {
        return (page: number, pageSize: number) => {
            const start = (page - 1) * pageSize
            const end = start + pageSize
            return articles.value.slice(start, end)
        }
    })

    // 获取文章详情
    const getArticleById = async (id: number): Promise<Article | undefined> => {
        return await articleApi.getArticleById(id)
    }

    // 获取文章列表
    const getArticlesByTag = async (tag: string): Promise<Article[]> => {
        return await articleApi.getArticleByTag(tag)
    }
    // 文章阅读量统计功能
    // 保存阅读量到localStorage
    const addViews = async (articleId: number) => {
        await articleApi.incrementViews(articleId)
        const article = articles.value.find(a => a.id === articleId)
        if (article) {
            article.views++
        }
    }
    // 从localStorage获取阅读量
    const loadViews = () => {
        articles.value.forEach(article => {
            const saved = localStorage.getItem('views_' + article.id)
            if (saved) {
                article.views = Number(saved)
            }
        })
    }
    loadViews()

    //文章收藏功能
    // 切换收藏功能
    const togglelike = async (articleId: number) => {
        const article = articles.value.find(a => a.id === articleId)
        if (article) {
            article.like = await articleApi.toggleLike(articleId)
        }
    }

    // 加载收藏
    const loadLike = () => {
        const saved = localStorage.getItem('liked_articles')
        if (saved) {
            const likeIds: number[] = JSON.parse(saved)
            articles.value.forEach(article => {
                article.like = likeIds.includes(article.id)
            })

        }
    }
    loadLike()


    return {
        articles,
        latestArticles,
        paginatedArticles,
        loading,
        getArticleById,
        getArticlesByTag,
        addViews,
        loadViews,
        togglelike,
        loadLike,
        loadArticles,
    }
})