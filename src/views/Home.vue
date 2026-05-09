<script setup lang="ts">
import { useBlogStore } from '@/stores/blog'
import { ElCard, ElDivider } from 'element-plus'
import { useRouter } from 'vue-router';

const blogStore = useBlogStore()
const router = useRouter()

</script>

<template>
    <section>
        <h1>一个博客</h1>
        <p>用于练习vue3知识和记录技术</p>

        <el-divider/>
        <h2>随便写写</h2>
        <el-card v-for="article in blogStore.latestArticles"  :key="article.id"
        class="article-id" shadow="hover" @click="router.push(`/articles/${article.id}`)">
            <h3>{{ article.title }}</h3>
            <p>{{ article.summary }}</p>
            <small>{{ article.createdAt }}</small>
        </el-card>
    </section>
</template>

<style scoped>
.article-card {
  margin-bottom: 16px;
  cursor: pointer;
}
</style>
