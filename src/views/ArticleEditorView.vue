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


const handleSave = (content:string ,title:string) => {
    const draft = articleManagerStore.saveDraft({title,content})
    articleId.value = draft.id
    alert('草稿已保存')
}

const handlePublish = (content: string, title: string) => {
    if (articleId.value) {
        const publishedArticle = articleManagerStore.publishArticle(articleId.value)
        if (publishedArticle) {
            alert('文章已发布')
            articleId.value = undefined
        } else {
            alert('发布失败')
        }
    } else {
        const draft = articleManagerStore.saveDraft({ content, title })
        const publishedArticle = articleManagerStore.publishArticle(draft.id)
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
    if(id){
        const numId = Number(id)
        // 已发布文章找
        const publishId = blogStore.articles.find(a => a.id === numId)
        if(publishId){
            articleId.value = numId
            initialTitle.value = publishId.title
            initialContent.value = publishId.content
            return
        }
        // 草稿找
        const draft = articleManagerStore.drafts.find(d => d.id === numId)
        if(draft){
            articleId.value = numId
            initialContent.value = draft.content
            initialTitle.value = draft.title
        }
    }
})

</script>

<style scoped>
.editor-views{
    height: 100vh;
}
</style>