<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBlogStore } from '../stores/blog'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getTagColor } from '@/composables/useTagColor'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchStore } from '@/stores/search'
import LoadFailed from '@/components/LoadFailed.vue'

const blogStore = useBlogStore()
const router = useRouter()
const { filteredArticles } = useSearchFilter()
const searchStore = useSearchStore()

// 获取所有分类
const categories = computed(() => {
  const cats = new Set<string>()
  blogStore.articles.forEach((article) => {
    if (article.category) {
      cats.add(article.category)
    }
  })
  return Array.from(cats)
})

// 分页功能
const currentPage = ref(1)
const pageSize = ref(5)
// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredArticles.value.length / pageSize.value)
})
// 计算当前页索引
const start = computed(() => {
  return (currentPage.value - 1) * pageSize.value
})
const end = computed(() => {
  return start.value + pageSize.value - 1
})
// 切换页面
const gotoPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
// 筛选条件变化时回到第一页：否则页码可能停在"第 4 页"，而筛选后只剩 1 页，列表会整个空掉
watch(filteredArticles, () => {
  currentPage.value = 1
})
const nextPage = () => {
  gotoPage(currentPage.value + 1)
}
const prevPage = () => {
  gotoPage(currentPage.value - 1)
}
const goToArticle = (id: number) => {
  router.push(`/articles/${id}`)
}

onMounted(() => {
  blogStore.loadArticles()
})
</script>

<template>
  <section>
    <div class="article-list-container">
      <!-- 返回首页按钮 -->
      <el-button link @click="router.push('/')">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回首页...
      </el-button>

      <!-- 文章列表内容 -->
    </div>
    <h1>文章列表</h1>
    <!-- 分类选择 -->
    <div class="category-selected">
      <el-select v-model="searchStore.selectedCategory" placeholder="选择" clearable>
        <el-option label="全部分类" value=""></el-option>
        <el-option
          v-for="category in categories"
          :key="category"
          :label="category"
          :value="category"
        ></el-option>
      </el-select>
    </div>
    <br />
    <div v-if="blogStore.loading" class="skeleton-list">
      <el-skeleton v-for="n in 3" :key="n" animated>
        <el-skeleton-item variant="h3" style="width: 50%; margin-bottom: 12px" />
        <el-skeleton-item variant="text" style="width: 90%; margin-bottom: 8px" />
        <el-skeleton-item variant="text" style="width: 70%" />
      </el-skeleton>
    </div>
    <LoadFailed v-else-if="blogStore.loadError" @retry="blogStore.loadArticles(true)" />
    <el-empty v-else-if="filteredArticles.length === 0" description="没有找到符合条件的文章" />
    <template v-else>
      <el-card
        v-for="article in filteredArticles.slice(start, end)"
        :key="article.id"
        class="article-card"
        shadow="hover"
        @click="goToArticle(article.id)"
      >
        <h2>{{ article.title }}</h2>
        <p class="summary">{{ article.summary }}</p>

        <el-tag
          v-for="(tag, index) in article.tags"
          :key="index"
          class="tag"
          :style="{ color: getTagColor(tag) }"
        >
          {{ tag }}
        </el-tag>
      </el-card>
    </template>
    <!-- 分页按钮 -->
    <div v-if="totalPages > 0" class="pagination">
      <el-button :disabled="currentPage === 1" @click="prevPage">上一页</el-button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <el-button :disabled="currentPage === totalPages" @click="nextPage">下一页</el-button>
    </div>
  </section>
</template>

<style scoped>
.article-list-container > .el-button {
  margin-bottom: 20px;
}

.category-selected {
  margin-bottom: 20px;
}

.skeleton-list el-skeleton {
  margin-bottom: 24px;
}

.category-selected .el-select {
  width: 200px;
}

.article-card {
  margin-bottom: 16px;
  cursor: pointer;
}

.tag {
  margin-right: 8px;
  margin-top: 5px;
}

.article-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-card {
  margin-bottom: 16px;
  cursor: pointer;
}

.summary {
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  color: #999;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
