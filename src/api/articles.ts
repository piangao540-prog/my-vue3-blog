import type { Article } from '@/stores/blog'
import { articleList } from '@/data/articles'

const mockArticles: Article[] = articleList

//模拟异步延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 获取所有文章
export const getArticles = async () => {
    await delay(500)
    return [...mockArticles]
}

// 根据ID获取文章
export const getArticleById = async (id: number): Promise<Article | undefined> => {
    await delay(300)
    return mockArticles.find(i => i.id === id)
}

// 根据标签获取文章
export const getArticleByTag = async (tag: string): Promise<Article[]> => {
    await delay(300)
    return mockArticles.filter(i => i.tags.includes(tag))
}

// 更新阅读量
export const incrementViews = async (id: number): Promise<void> => {
    await delay(100)
    const article = mockArticles.find(i => i.id === id)
    if (article) {
        article.views++
    }
}

// 切换收藏状态
export const toggleLike = async (id: number): Promise<boolean> => {
    await delay(100)
    const article = mockArticles.find(i => i.id === id)
    if (article) {
        article.like = !article.like
        return article.like
    }
    return false
}