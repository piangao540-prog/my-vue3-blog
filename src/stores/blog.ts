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
    views: number
    like: boolean
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
    // 文章阅读量统计功能
    // 保存阅读量到localStorage
    const addViews = (articleId: number) => {
        const article = articles.value.find(a => a.id === articleId)
        if (article) {
            article.views++
            localStorage.setItem('views_' + articleId, article.views.toString())
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
    const togglelike = (articleId: number) => {
        const article = articles.value.find(a => a.id === articleId)
        if (article) {
            article.like = !article.like
            const likeIds = articles.value.filter(a => a.like).map(a => a.id)
            localStorage.setItem('liked_articles', JSON.stringify(likeIds))
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
        getArticleById,
        getArticlesByTag,
        addViews,
        loadViews,
        togglelike,
        loadLike,
    }
})