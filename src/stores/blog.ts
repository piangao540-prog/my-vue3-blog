import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as articleApi from '@/api/articles'
import { useUserStore } from './user'

export interface Article {
  id: number
  title: string
  summary: string
  content: string
  createdAt: string //现有的创建时间
  sumTag: string
  tags: string[]
  views: number
  like: boolean
  status?: 'draft' | 'published' //文章状态
  category?: string
  wordCount?: number // 字数统计
  updatedAt?: string
  publishedAt?: string //发布时间
}

export const useBlogStore = defineStore('blog', () => {
  const userStore = useUserStore()
  const articles = ref<Article[]>([])
  const loading = ref(false)
  // 加载失败要跟"确实没有文章"区分开，否则页面会显示成一片空白
  const loadError = ref(false)

  // 首页/文章页/后台切换时都会重新加载，加一层短缓存挡掉重复请求
  const CACHE_TTL = 5 * 60 * 1000
  let loadedAt = 0

  // 发布/删除后调用，让列表下次进入时重新拉
  const invalidateArticles = () => {
    loadedAt = 0
  }

  // 初始化加载文章。force = true 时跳过缓存强制刷新
  const loadArticles = async (force = false) => {
    if (!force && articles.value.length && Date.now() - loadedAt < CACHE_TTL) return
    loading.value = true
    loadError.value = false
    try {
      // 加载文章数据
      articles.value = (await articleApi.getArticles()).filter((a) => a.status !== 'draft')
      loadedAt = Date.now()
      await loadLike() // 文章加载后再恢复收藏状态
    } catch (error) {
      loadError.value = true
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
    const article = articles.value.find((a) => a.id === articleId)
    if (article) {
      article.views++
    }
  }

  //文章收藏功能

  // 切换收藏功能
  const togglelike = async (articleId: number) => {
    const article = articles.value.find((a) => a.id === articleId)
    if (article && userStore.userInfo?.username) {
      article.like = await articleApi.toggleLike(
        articleId,
        userStore.userInfo.username,
        article.like,
      )
    }
  }

  // 加载收藏
  const loadLike = async () => {
    if (!userStore.userInfo?.username) return
    const likedIds = await articleApi.getFavorites(userStore.userInfo?.username)
    articles.value.forEach((article) => {
      article.like = likedIds.includes(article.id)
    })
  }

  // 删除文章
  const deleteArticle = async (id: number) => {
    await articleApi.deleteArticle(id)
    articles.value = articles.value.filter((a) => a.id !== id)
    localStorage.removeItem(`article_${id}`)
    localStorage.removeItem(`draft_${id}`)
  }

  return {
    articles,
    latestArticles,
    paginatedArticles,
    loading,
    loadError,
    getArticleById,
    getArticlesByTag,
    addViews,
    togglelike,
    loadLike,
    loadArticles,
    invalidateArticles,
    deleteArticle,
  }
})
