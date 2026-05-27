import { defineStore } from "pinia"
import { ref } from 'vue'
import type { Article } from "./blog"
import { createArticle, updateArticle ,deleteArticle,getArticles} from "@/api/articles"

export const useArticleManagerStore = defineStore('articleManager', () => {
    const drafts = ref<Article[]>([])
    const isLoading = ref(false)

    // 保存草稿
    const saveDraft = async (article: Partial<Article>) => {
        const result = await createArticle({
            title: article.title || '未命名草稿',
            content: article.content || '',
            tags: article.tags || [],
            category: article.category,
            status: 'draft'
        })

        // 更新draft数据
        const draft: Article = {
            id: result.id,
            title: article.title || '未命名草稿',
            content: article.content || '',
            summary: article.summary || '',
            createdAt: new Date().toISOString(),
            sumTag: article.sumTag || '',
            tags: article.tags || [],
            views: 0,
            like: false,
            status: 'draft',
            updatedAt: new Date().toISOString(),
            wordCount: calculateWordCount(article.content || ''),
        }

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
    const loadDrafts = async () => {
        const allArticles = await getArticles()
        drafts.value = allArticles.filter(a => a.status === 'draft')
    }


    // 删除草稿
    const deleteDraft = async (id: number) => {
        await deleteArticle(id)
        drafts.value = drafts.value.filter(a => a.id !== id)
    }

    // 发布文章
    const publishArticle = async (draftId: number) => {
        try {
            const draft = drafts.value.find(d => d.id === draftId)
            if (!draft) return false
            await updateArticle(draftId, {
                title: draft.title,
                content: draft.content,
                summary: draft.summary,
                tags: draft.tags,
                category: draft.category,
                status: 'published'
            })
            drafts.value = drafts.value.filter(d => d.id !== draftId)
            return true
        } catch (error) {
            console.log('发布失败', error)
            return false
        }
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
        calculateWordCount,
    }
})