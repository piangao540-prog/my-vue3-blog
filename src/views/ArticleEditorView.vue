<template>
    <div class="editor-views">
        <ArticleEditor @save="handleSave" @publish="handlePublish" />
    </div>
</template>

<script lang="ts" setup>
import ArticleEditor from '@/components/ArticleEditor.vue';

const handleSave = (content:string ,title:string) => {
    alert('草稿已保存')
}

const handlePublish = (content:string ,title:string ) => {
    alert('文章已发布')
}
</script>

<style scoped>
.editor-views{
    height: 100vh;
}
</style>