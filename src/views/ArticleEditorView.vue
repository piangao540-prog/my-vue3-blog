<template>
    <div class="editor-views">
        <ArticleEditor
        :article-id="articleId" :initial-title="initialTitle" :initial-content="initialContent" 
        @save="handleSave" @publish="handlePublish" />
    </div>
</template>

<script lang="ts" setup>
import {ref,onMounted} from 'vue'
import ArticleEditor from '@/components/ArticleEditor.vue'
import { useArticleManagerStore } from '@/stores/articleManager'
import { useBlogStore } from '@/stores/blog'
import { useRoute } from 'vue-router'


const blogStore = useBlogStore()
const route = useRoute()
const articleManagerStore = useArticleManagerStore()
const articleId = ref<number | undefined>(undefined)
const initialTitle = ref('')
const initialContent = ref('')


const handleSave = async (content:string ,title:string) => {
    const draft = await articleManagerStore.saveDraft({title,content})
    articleId.value = draft.id
    alert('草稿已保存')
}

// 发布文章
const handlePublish = async (content: string, title: string) => {
    if (articleId.value) {
        const publishedArticle = await articleManagerStore.publishArticle(articleId.value)
        if (publishedArticle) {
            alert('文章已发布')
            articleId.value = undefined
        } else {
            alert('发布失败')
        }
    } else {
        const draft = articleManagerStore.saveDraft({ content, title })
        const publishedArticle = await articleManagerStore.publishArticle((await draft).id)
        if (publishedArticle) {
            alert('文章已发布')
        } else {
            alert('发布失败')
        }
    }
}



onMounted(() => {
    articleManagerStore.loadDrafts()
    const id = route.query.id
    if (id) {
        const numId = Number(id)
        
        // 从 localStorage 直接读
        const saved = localStorage.getItem(`article_${numId}`) || localStorage.getItem(`draft_${numId}`)
        if (saved) {
            const article = JSON.parse(saved)
            articleId.value = numId
            initialTitle.value = article.title
            initialContent.value = article.content
            return
        }
        
        // 再从 blogStore 的静态文章找
        const publishId = blogStore.articles.find(a => a.id === numId)
        if (publishId) {
            articleId.value = numId
            initialTitle.value = publishId.title
            initialContent.value = publishId.content
        }
    }
})


</script>

<style scoped>
.editor-views{
    height: 100vh;
}
</style>