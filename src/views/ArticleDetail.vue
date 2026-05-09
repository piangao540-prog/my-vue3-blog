<template>
  <section v-if="article">
    <h1>{{ article.title }}</h1>
    <p>{{ article.createdAt }}</p>

    <el-tag
      v-for="tag in article.tags"
      :key="tag"
      class="tag"
    >
      {{ tag }}
    </el-tag>

    <el-divider />

    <p>{{ article.content }}</p>
  </section>

  <el-empty v-else description="文章不存在" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBlogStore } from '../stores/blog'

const route = useRoute()
const blogStore = useBlogStore()

const article = computed(() => {
  return blogStore.getArticleById(Number(route.params.id))
})
</script>

<style scoped>
.tag {
  margin-right: 8px;
}
</style>
