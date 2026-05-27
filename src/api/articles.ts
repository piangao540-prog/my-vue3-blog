import axios from './axios'
import type { Article } from '@/stores/blog'

// 获取所有文章
export const getArticles = async (): Promise<Article[]> => {
    const response = await axios.get('/articles')
    return response.data.map((a: any) => ({
        ...a,
        tags: typeof a.tags === 'string' ? JSON.parse(a.tags) : a.tags
    }))
}

// 根据ID获取文章
export const getArticleById = async (id: number): Promise<Article | undefined> => {
    const response = await axios.get(`/articles/${id}`)
    const article = response.data
    if (article) {
        article.tags = typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags
    }
    return article
}

// 根据标签获取文章
export const getArticleByTag = async (tag: string): Promise<Article[]> => {
    const response = await axios.get('/articles', { params: { tag } })
    return response.data.filter((a: Article) => a.tags?.includes(tag))
}

// 更新阅读量
export const incrementViews = async (id: number): Promise<void> => {
    await axios.post(`/articles/${id}/views`)
}


// 切换收藏状态
export const toggleLike = async (id: number): Promise<boolean> => {
    return false
}

// 创建文章
export const createArticle = async (article: {
    title: string
    content: string
    summary?: string
    tags?: string[]
    category?: string
    status?: 'draft' | 'published'
}): Promise<{ id: number }> => {
    const response = await axios.post('/articles', article)
    return response.data
}

// 更新文章
export const updateArticle = async (id: number, article: {
    title?: string
    content?: string
    summary?: string
    tags?: string[]
    category?: string
    status?: 'draft' | 'published'
}): Promise<void> => {
    await axios.put(`/articles/${id}`, article)
}