import { defineStore } from "pinia"
import { ref } from 'vue'
import type { Article } from "./blog"

export const useArticleManagerStore = defineStore('articleManager', () => {
    const drafts = ref<Article[]>([])
    const isLoading = ref(false)

    // 保存草稿
    const saveDraft = (article: Partial<Article>) => {
        const draft: Article = {
            id: article.id || Date.now(),  // 如果没有ID，使用时间戳
            title: article.title || '未命名草稿',
            content: article.content || '',
            summary: article.summary || '',
            createdAt: article.createdAt || new Date().toISOString(),
            sumTag: article.sumTag || '',
            tags: article.tags || [],
            views: article.views || 0,
            like: article.like || false,
            status: 'draft',
            updatedAt: new Date().toISOString(),
            wordCount: calculateWordCount(article.content || ''),
        }
        // 保存到localStorage
        localStorage.setItem(`draft_${draft.id}`, JSON.stringify(draft))

        // 更新draft数据
        const existingIndex = drafts.value.findIndex(a => a.id === draft.id)
        if (existingIndex >= 0) {
            drafts.value[existingIndex] = draft //更新
        }
        else {
            drafts.value.push(draft) //新增
        }

        return draft
    }

    // 加载所有草稿
    const loadDrafts = () => {
        drafts.value = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith('draft_')) {
                const draftData = localStorage.getItem(key)
                if (draftData) {
                    drafts.value.push(JSON.parse(draftData))
                }
            }
        }
    }

    // 删除草稿
    const deleteDraft = (id: number) => {
        localStorage.removeItem(`draft_${id}`)
        drafts.value = drafts.value.filter(a => a.id !== id)
    }

    // 发布文章
    const publishArticle = (draftId: number) => {
        const draft = drafts.value.find(d => d.id === draftId)
        if (!draft) return null

        const publishedArticle: Article = {
            ...draft,
            status: 'published',
            publishedAt: new Date().toISOString()
        }

        // 保存已发布的文章
        localStorage.setItem(`article_${publishedArticle.id}`, JSON.stringify(publishedArticle))

        // 删除草稿
        deleteDraft(draftId)

        return publishedArticle
    }


    // 计算字数（支持中英文）
    const calculateWordCount = (content: string): number => {
        if (!content) return 0

        // 移除HTML标签
        const textOnly = content.replace(/<[^>]*>/g, '')

        // 统计中文字符（每个中文字符算一个字）
        const chineseChars = (textOnly.match(/[\u4e00-\u9fa5]/g) || []).length

        // 统计英文单词
        const englishWords = textOnly.replace(/[\u4e00-\u9fa5]/g, '')
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0).length

        return chineseChars + englishWords
    }

    return {
        drafts,
        isLoading,
        saveDraft,
        loadDrafts,
        deleteDraft,
        publishArticle,
        calculateWordCount
    }
})