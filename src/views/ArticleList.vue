<script setup lang="ts">
import { useBlogStore } from '../stores/blog'
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue'

const blogStore = useBlogStore()
const router = useRouter()
</script>

<template>
 <section>
      <div class="article-list-container">
      <!-- 返回首页按钮 -->
      <el-button text @click="router.push('/')">
        <el-icon><ArrowLeft /></el-icon> 返回首页...
      </el-button>

      <!-- 文章列表内容 -->
      
    </div>
    <h1>文章列表</h1>
    <br>
    <el-card
      v-for="article in blogStore.articles"
      :key="article.id"
      class="article-card"
      shadow="hover"
      @click="router.push(`/articles/${article.id}`)"
    >
      <h2>{{ article.title }}</h2>
      <p>{{ article.summary }}</p>

      <el-tag
        v-for="tag in article.tags"
        :key="tag"
        class="tag"
      >
        {{ tag }}
      </el-tag>
    </el-card>
  </section>
</template>

<style scoped>
.article-list-container > .el-button {
  margin-bottom: 20px;
}

.article-card {
  margin-bottom: 16px;
  cursor: pointer;
}

.tag {
  margin-right: 8px;
  margin-top: 5px;
}
</style>
