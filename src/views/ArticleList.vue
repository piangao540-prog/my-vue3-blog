<script setup lang="ts">
import { ref, computed, onMounted} from 'vue'
import { useBlogStore } from '../stores/blog'
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue'
import { getTagColor } from '@/composables/useTagColor'
import { useSearchFilter } from '@/composables/useSearchFilter';
import { useSearchStore } from '@/stores/search';

const blogStore = useBlogStore()
const router = useRouter()
const {filteredArticles} = useSearchFilter()
const searchStore = useSearchStore()

// 获取所有分类
const categories = computed(() => {
  const cats = new Set<string>()
  blogStore.articles.forEach(article => {
    if(article.category){
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
// 计算文章列表
const paginatedArticles = computed(() => {
  return filteredArticles.value.slice(start.value, end.value)
})
// 切换页面
const gotoPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
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
        </el-icon> 返回首页...
      </el-button>

      <!-- 文章列表内容 -->

    </div>
    <h1>文章列表</h1>
    <!-- 分类选择 -->
    <div class="category-selected">
      <el-select v-model="searchStore.selectedCategory" placeholder="选择" clearable>
        <el-option label="全部分类" value=""></el-option>
        <el-option v-for="category in categories" :key="category" :label="category" :value="category"></el-option>
      </el-select>
    </div>
    <br>
    <el-card v-for="article in filteredArticles.slice(start,end)" :key="article.id" class="article-card" shadow="hover"
      @click="goToArticle(article.id)">
      <h2>{{ article.title }}</h2>
      <p class="summary">{{ article.summary }}</p>

      <el-tag v-for="(tag, index) in article.tags" :key="index" class="tag" :style="{ color: getTagColor(tag) }">
        {{ tag }}
      </el-tag>
    </el-card>
    <!-- 分页按钮 -->
    <div class="pagination">
      <el-button :disabled="currentPage === 1" @click="prevPage">上一页</el-button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <el-button :disabled="currentPage === totalPages" @click="nextPage">下一页</el-button>
    </div>
  </section>
</template>

<style scoped>
.article-list-container>.el-button {
  margin-bottom: 20px;
}

.category-selected{
  margin-bottom: 20px;
}

.category-selected .el-select{
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
