<script setup lang="ts">
import { computed, onMounted, ref} from 'vue'
import { useBlogStore } from '@/stores/blog'
import { ElCard, ElTag, ElRow, ElCol } from 'element-plus'
import { Document, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import TagFilter from '@/components/TagFilter.vue'
import { useSearchFilter } from '@/composables/useSearchFilter'
import SortFilter from '@/components/SortFilter.vue'
import { useSort, type SortKey } from '@/composables/useSort'
import { getTagColor } from '@/composables/useTagColor'
import TagChart from '@/components/TagChart.vue'
import ArticleCarousel from '@/components/ArticleCarousel.vue'



const blogStore = useBlogStore()

const router = useRouter()

const goToArticle = (id: number) => {
  router.push(`/articles/${id}`)
}

const goToArticles = () => {
  router.push('/articles')
}
// 排序
const { currentSort, compareByKey } = useSort()
// 搜索
const { allTags, filteredArticles } = useSearchFilter()
const articles = computed(() => {
  const filtered = filteredArticles.value
  const { key, desc } = currentSort
  return [...filtered].sort((a, b) => {
    const comparison = compareByKey(a, b, key as SortKey)
    return desc ? -comparison : comparison
  })
})

// 跟随鼠标移动
const heroGlow = ref({x:20,y:50})
const handleHeroMove = (e:MouseEvent) => {
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  heroGlow.value = {
    x:((e.clientX - rect.left) / rect.width) * 100,
    y:((e.clientY - rect.top) / rect.height) * 100
  }
}

// 加载文章
onMounted(() => {
  blogStore.loadArticles()
})
</script>

<template>
  <div class="home-container">
    <section class="hero-section" @mousemove="handleHeroMove">
      <div class="hero-content">
        <!-- 左边：标题和按钮 -->
        <div class="hero-left">
          <h1 class="hero-title">个人博客</h1>
          <p class="hero-subtitle">
            Vue3、TypeScript、前端工程化等热门技术内容
          </p>
          <div class="hero-actions">
            <el-button type="primary" class="primary-action" size="default" @click="goToArticles">浏览文章</el-button>
            <el-button size="default" class="secondary-action" @click="router.push('/about')">关于我</el-button>
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
        </div>

        <!-- 右边：轮播图 -->
        <div class="hero-right">
          <ArticleCarousel />
        </div>
      </div>
    </section>

    <el-row :gutter="20" class="main-content">
      <el-col :xs="24" :sm="24" :md="16">
        <section class="latest-articles">
          <div class="section-header">
            <div class="header-left">
              <el-icon>
                <Document />
              </el-icon>
              <h2>最新文章</h2>
            </div>
            <SortFilter />
            <el-button type="primary" @click="router.push('/editor')">
              打开编辑器
            </el-button>
            <el-button text @click="goToArticles">查看全部 →</el-button>
          </div>
          <TagFilter />
          <div v-if="blogStore.loading" class="skeleton-list">
            <el-skeleton v-for="n in 3" :key="n" animated>
              <el-skeleton-item variant="h3" style="width: 60%; margin-bottom: 12px;"/>
              <el-skeleton-item variant="text" style=" margin-bottom: 8px;"/>
              <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 8px;"/>
              <el-skeleton-item variant="text" style="width: 60%;"/>
            </el-skeleton>
          </div>
          <el-card v-for="article in articles" :key="article.id" class="article-card" shadow="hover"
            @click="goToArticle(article.id)">
            <div class="article-content">
              <div class="article-info">
                <h3>{{ article.title }}</h3>
                <p class="article-summary">{{ article.summary }}</p>
                <div class="article-meta">
                  <span class="article-date">{{ article.createdAt.slice(0,10)}}</span>
                  <span class="article-views">
                    <el-icon>
                      <View />
                    </el-icon> {{ article.views }}
                  </span>
                  <span class="article-like" :type="article.like ? 'primary' : 'default'"
                    @click.stop="blogStore.togglelike(article.id)">
                    {{ article.like ? '❤️ 已收藏' : '🤍 收藏' }}
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
              <el-tag v-for="tag in allTags" :key="tag" class="tag-item" type="info" effect="plain"
                :style="{ color: getTagColor(tag) }">
                {{ tag }}
              </el-tag>
            </div>
            <TagChart />
          </el-card>

          <el-card class="sidebar-card">
            <template #header>
              <div class="card-header">
                <span>📖 推荐阅读</span>
              </div>
            </template>
            <div class="recommended-list">
              <div v-for="article in blogStore.latestArticles.slice(0, 3)" :key="article.id" class="recommended-item"
                @click="goToArticle(article.id)">
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero-section {
  max-width: 900px;
  height: 300px;
  margin: 0px auto;
  background-color: #0a0a23;
  background-image:
    linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px),
    radial-gradient(ellipse at v-bind('heroGlow.x + "%"') v-bind('heroGlow.y + "%"'), rgba(232, 100, 255, 0.15) 0%, transparent 60%);
  background-size: 40px 40px, 40px 40px, 100% 100%;
  border-radius: 16px;
  padding: 40px;
  color: white;
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
  background-position: 0% 50%, 0% 50%, 20% 50%;
  transition: background-position 0.3s;

}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  height: 100%;
}

.hero-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main-content {
  max-width: 1112px;
  /* margin-left: -70px !important; */

  margin-top: 56px;
}

.hero-title {
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 0;
}

.hero-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
  max-width: 400px;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.primary-action {
  background-color: #e86f83;
  border-color: #e86f83;
  color: #fff;
  border-radius: 20px;
  padding: 8px 20px;
}

.primary-action:hover {
  background-color: #d95d72;
  border-color: #d95d72;
  color: #fff;
}

.secondary-action {
  border-radius: 20px;
  padding: 8px 20px;
}

.hero-stats {
  display: flex;
  gap: 30px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.85rem;
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
  transition: transform 0.2s, box-shadow 0.2s;
  animation: slideUp 0.4s ease;

}

.article-card:hover{
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
  /* max-width: 700px; */
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

/* 入场动画 */
.hero-section{
  animation: fadeInDown 0.5s ease;
}

.hero-left{
  animation: fadeInLeft 0.5s ease 0.1s both;
}

.hero-right{
    animation: fadeInRight 0.5s ease 0.2s both;
}

.main--content{
    animation: fadeInUp 0.5s ease 0.3s both;
}


.article-card {
    animation: fadeInUp 0.4s ease backwards;
}

.article-card:nth-child(1) {animation-delay: 0.3s;}
.article-card:nth-child(2) {animation-delay: 0.4s;}
.article-card:nth-child(3) {animation-delay: 0.5s;}

.sidebar-card {
  animation: fadeInRight 0.4s ease backwards;
}
.sidebar-card:nth-child(1) { animation-delay: 0.4s; }
.sidebar-card:nth-child(2) { animation-delay: 0.5s; }

@keyframes fadeInUp {
  form {opacity:0; transform: translateX(20px);}
  to {opacity:1; transform: translateX(0);}
}

@keyframes fadeInDown {
  from {opacity:0; transform: translateX(-20px);}
  to {opacity:1; transform: translateX(0);}
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  /* 整体容器适配 */
  .home-container {
    padding: 10px;
    max-width: 100%;
  }
  
  .hero-section {
    width: 100%;
    height: auto;
    min-height: 250px;
    margin: 0;
    border-radius: 12px;
  }
  
  .latest-articles {
    margin-bottom: 20px;
  }
  
  .sidebar-card {
    margin-bottom: 15px;
  }

  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .hero-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .hero-left {
    order: 1;
    margin-bottom: 20px;
  }
  
  .hero-right {
    order: 2;
    width: 100%;
  }
  
  .hero-title {
    font-size: 1.5rem; /* 减小字体 */
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-stats {
    justify-content: center;
  }
  /* 主内容 */
  .main-content {
    flex-direction: column;
    width: 100% !important;
    margin-left: 0 !important;
  }
  
  .el-col {
    width: 100% !important;
  }
  
  .sidebar {
    margin-top: 30px;
  }
/* 文章卡片 */
  .article-card {
    margin-bottom: 12px;
    padding: 15px;
  }
  
  .article-content h3 {
    font-size: 1.1rem;
  }
  
  .article-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .article-tags {
    width: 100%;
    margin-top: 8px;
  }
  /* 标签 */
    .tags-cloud {
    justify-content: center;
  }
  
  .tag-item {
    margin: 4px;
    font-size: 0.85rem;
  }
  
  /* 筛选器适配 */
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-left {
    width: 100%;
  }

}

@media (max-width:1024px) {
  .hero-section {
    max-width: 814px;
  }

  .main-content {
    max-width: 860px;
    margin-left: 28px !important;
  }

}

/* 文章阅读量显示 */
.article-views {
  display: flex;
  align-items: center;
  gap: 4px;
  /* 图标和数字之间的间距 */
  color: #909399;
  /* 和日期同色 */
  font-size: 0.85rem;
}

.article-like {
  display: flex;
  align-items: center;
  gap: 4px;
  /* 图标和数字之间的间距 */
  color: #909399;
  /* 和日期同色 */
  font-size: 0.85rem;
  transition: transform 0.2s;
}

.article-like:active {
  transform: scale(1.2);
}

html.dark .recommended-item {
  background: #2a2a2a;
}
html.dark .recommended-item:hover {
  background: #333;
}

</style>