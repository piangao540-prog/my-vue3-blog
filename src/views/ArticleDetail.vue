<template>
  <div class="article-detail" v-if="article">
    <el-button link @click="router.push('/articles')">
      <el-icon>
        <ArrowLeft />
      </el-icon>返回文章列表
    </el-button>
    <!-- 文章主题 -->
    <article class="article-main">
      <header class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="meta-item">
            <el-icon>
              <Calendar />
            </el-icon>
            {{ article.createdAt }}
          </span>
          <span class="meta-item">
            <el-icon>
              <User />
            </el-icon>
            Piangao
          </span>
          <div class="article-tags">
            <el-tag v-for="tag in article.tags" :key="tag" size="small">
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </header>
      <div class="article-content" v-html="article.content"></div>
      <footer class="article-footer">
        <el-divider />
        <div class="article-nav">
          <div class="nav-prev" v-if="prevArticle" @click="goToArticle(prevArticle.id)">
            <span class="nav-label">← 上一篇</span>
            <span>{{ prevArticle.title }}</span>
          </div>
          <div class="nav-next" v-if="nextArticle" @click="goToArticle(nextArticle.id)">
            <span class="nav-label">下一篇 →</span>
            <span>{{ nextArticle.title }}</span>
          </div>
        </div>
      </footer>
    </article>
    <!-- 评论区 -->
    <div v-if="userStore.isLoggedIn">
      <CommentSection />
    </div>
    <div v-else>
      <div class="login-prompt">
        <p>请先登录才能发表评论</p>
        <router-link to="/login">
          <el-button type="primary">去登录</el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'
import { Calendar, User, ArrowLeft } from '@element-plus/icons-vue'
import CommentSection from '../components/CommentSection.vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const article = computed(() => {
  return blogStore.getArticleById(Number(route.params.id))
})
// 获取当前文章的索引
const currentIndex = computed(() => {
  return blogStore.articles.findIndex((item) => item.id === Number(route.params.id))
})
// 获取上一篇文章
const prevArticle = computed(() => {
  const index = currentIndex.value
  return index > 0 ? blogStore.articles[index - 1] : null
})
// 获取下一篇文章
const nextArticle = computed(() => {
  const index = currentIndex.value
  return index < blogStore.articles.length - 1 ? blogStore.articles[index + 1] : null
})

// 跳转到指定文章
const goToArticle = (id: number) => {
  router.push(`/articles/${id}`)
}

// 文章阅读量统计
onMounted(() => {
  if (article.value) {
    blogStore.addViews(article.value.id)
  }
})

</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-main {
  margin-top: 20px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.article-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.article-title {
  font-size: 2rem;
  color: #303133;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 0.9rem;
}

.article-tags {
  display: flex;
  gap: 8px;
}

.article-content {
  line-height: 1.8;
  font-size: 1rem;
  color: #333;
}

.article-content :deep(h2) {
  margin-top: 32px;
  margin-bottom: 16px;
  color: #303133;
  font-size: 1.5rem;
}

.article-content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 12px;
  color: #303133;
  font-size: 1.25rem;
}

.article-content :deep(p) {
  margin-bottom: 16px;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.article-content :deep(li) {
  margin-bottom: 8px;
}

.article-content :deep(pre) {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.article-content :deep(code) {
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 16px 0;
  color: #666;
}

.article-footer {
  margin-top: 40px;
}

.article-nav {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.nav-prev,
.nav-next {
  flex: 1;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-prev:hover,
.nav-next:hover {
  background: #ecf5ff;
}

.nav-label {
  display: block;
  font-size: 0.85rem;
  color: #909399;
  margin-bottom: 8px;

}

.nav-prev a,
.nav-next a {
  color: #409eff;
  font-size: 0.95rem;
  cursor: pointer;
}

.nav-next {
  text-align: right;
}

.login-prompt {
  text-align: center;
  padding: 40px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 20px;
}

.login-prompt p {
  margin-bottom: 16px;
  color: #666;
}
</style>
