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
})

</script>

<style scoped>
.editor-views{
    height: 100vh;
}
</style>