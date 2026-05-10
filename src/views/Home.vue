<script setup lang="ts">
import { useBlogStore } from '@/stores/blog'
import { ElCard, ElTag, ElRow, ElCol } from 'element-plus'
import { Document, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const blogStore = useBlogStore()
const router = useRouter()

const goToArticle = (id: number) => {
  router.push(`/articles/${id}`)
}

const goToArticles = () => {
  router.push('/articles')
}

const allTags = ['Vue3', 'Vite', 'TypeScript', 'pinia', 'CSS3', 'ElementPlus']
</script>

<template>
  <div class="home-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">个人博客</h1>
        <p class="hero-subtitle">
           Vue3、TypeScript、前端工程化等热门技术内容
        </p>
        <div class="hero-actions">
          <el-button type="primary" class="primary-action" size="large" @click="goToArticles">浏览文章</el-button>
          <el-button size="large" class="secondary-action" @click="router.push('/about')">关于我</el-button>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-number">{{ blogStore.articles.length }}</span>
          <span class="stat-label">篇文章</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ allTags.length }}</span>
          <span class="stat-label">个标签</span>
        </div>
      </div>
    </section>

    <el-row :gutter="20" class="main-content">
      <el-col :xs="24" :sm="24" :md="16">
        <section class="latest-articles">
          <div class="section-header">
            <div class="header-left">
              <el-icon><Document /></el-icon>
              <h2>最新文章</h2>
            </div>
            <el-button text @click="goToArticles">查看全部 →</el-button>
          </div>

          <el-card v-for="article in blogStore.latestArticles" :key="article.id"
            class="article-card" shadow="hover"@click="goToArticle(article.id)">
            <div class="article-content">
              <div class="article-info">
                <h3>{{ article.title }}</h3>
                <p class="article-summary">{{ article.summary }}</p>
                <div class="article-meta">
                  <span class="article-date">{{ article.createdAt }}</span>
                  <span class="article-views">
                    <el-icon><View /></el-icon> {{ article.views }}
                  </span>
                  <div class="article-tags">
                    <el-tag v-for="tag in article.tags" :key="tag" size="small" type="info">
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </section>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8">
        <aside class="sidebar">
          <el-card class="sidebar-card">
            <template #header>
              <div class="card-header">
                <span>🏷️ 热门标签</span>
              </div>
            </template>
            <div class="tags-cloud">
              <el-tag
                v-for="tag in allTags"
                :key="tag"
                class="tag-item"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-card>

          <el-card class="sidebar-card">
            <template #header>
              <div class="card-header">
                <span>📖 推荐阅读</span>
              </div>
            </template>
            <div class="recommended-list">
              <div
                v-for="article in blogStore.latestArticles.slice(0, 3)"
                :key="article.id"
                class="recommended-item"
                @click="goToArticle(article.id)"
              >
                <span class="recommended-title">{{ article.title }}</span>
              </div>
            </div>
          </el-card>
        </aside>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 996px;
  margin: 0 auto;
  padding: 20px;
}

.hero-section {
  /* width: 500px;
  height: 300px; */
  background: linear-gradient(135deg, #68696f 0%, #370c61 100%);
  border-radius: 16px;
  padding: 60px 40px;
  color: white;
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto 24px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.primary-action {
  background-color: #e86f83;
  border-color: #e86f83;
  color: #fff;
  border-radius: 20px;
  padding: 0 22px;
}

.primary-action:hover {
  background-color: #d95d72;
  border-color: #d95d72;
  color: #fff;
}

.secondary-action {
  border-radius: 20px;
  padding: 0 22px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #303133;
  margin: 0;
}

.latest-articles {
  margin-bottom: 30px;
}

.article-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.article-content h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 1.2rem;
}

.article-summary {
  color: #606266;
  margin: 8px 0;
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.article-date {
  color: #909399;
  font-size: 0.85rem;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  border-radius: 12px;
}

.card-header {
  font-weight: 600;
  font-size: 1rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  transform: scale(1.05);
}

.recommended-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommended-item {
  padding: 10px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.2s;
}

.recommended-item:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.recommended-title {
  font-size: 0.95rem;
  color: #409eff;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-stats {
    gap: 20px;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}
/* 文章阅读量显示 */
.article-views {
  display: flex;
  align-items: center;
  gap: 4px;  /* 图标和数字之间的间距 */
  color: #909399;  /* 和日期同色 */
  font-size: 0.85rem;
}
</style>