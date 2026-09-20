<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getTagColor } from '@/composables/useTagColor'
import { useInterviewFilter } from '@/composables/useInterviewFilter'
import {
  useInterviewStore,
  RESULT_LABELS,
  RESULT_TAG_TYPES,
  RESULT_OPTIONS,
} from '@/stores/interview'

const router = useRouter()
const interviewStore = useInterviewStore()
const { interviews, loading } = storeToRefs(interviewStore)
const { resultFilter, yearFilter, tagFilter, filteredInterviews, allTags, allYears } =
  useInterviewFilter(interviews)

const currentPage = ref(1)
const pageSize = ref(6)
const totalPages = computed(() => Math.ceil(filteredInterviews.value.length / pageSize.value))
const pagedInterviews = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredInterviews.value.slice(start, start + pageSize.value)
})

// 筛选条件变化时回到第一页，否则可能停在某一页而结果只剩一页，列表会整个空掉
watch(filteredInterviews, () => {
  currentPage.value = 1
})

const goToDetail = (id: number) => {
  router.push(`/interviews/${id}`)
}

onMounted(() => {
  interviewStore.loadInterviews()
})
</script>

<template>
  <section class="interview-list">
    <el-button link @click="router.push('/')">
      <el-icon>
        <ArrowLeft />
      </el-icon>
      返回首页
    </el-button>

    <div class="page-head">
      <h1>面经</h1>
      <p>记录投过的公司、被问到的题和复盘。出于隐私考虑，公司名做了脱敏处理。</p>
    </div>

    <div class="filter-row">
      <el-select v-model="resultFilter" placeholder="面试结果" clearable class="filter-item">
        <el-option
          v-for="option in RESULT_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-select v-model="yearFilter" placeholder="年份" clearable class="filter-item">
        <el-option v-for="year in allYears" :key="year" :label="year" :value="year" />
      </el-select>
      <el-select v-model="tagFilter" placeholder="技术栈" clearable class="filter-item">
        <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
      </el-select>
    </div>

    <div v-if="loading" class="skeleton-list">
      <el-skeleton v-for="n in 3" :key="n" animated>
        <el-skeleton-item variant="h3" style="width: 50%; margin-bottom: 12px" />
        <el-skeleton-item variant="text" style="width: 90%; margin-bottom: 8px" />
        <el-skeleton-item variant="text" style="width: 70%" />
      </el-skeleton>
    </div>

    <el-empty v-else-if="filteredInterviews.length === 0" description="没有符合条件的面经" />

    <template v-else>
      <div class="card-grid">
        <el-card
          v-for="item in pagedInterviews"
          :key="item.id"
          class="interview-card"
          shadow="hover"
          @click="goToDetail(item.id)"
        >
          <div class="card-head">
            <h2>{{ item.company }}</h2>
            <el-tag :type="RESULT_TAG_TYPES[item.result]" size="small" effect="dark">
              {{ RESULT_LABELS[item.result] }}
            </el-tag>
          </div>

          <p class="position">{{ item.position }}</p>

          <div class="meta">
            <span>{{ item.interview_date || '时间未记' }}</span>
            <span v-if="item.channel">{{ item.channel }}</span>
            <span>{{ item.views }} 次浏览</span>
          </div>

          <div class="tags">
            <el-tag
              v-for="tag in item.tags"
              :key="tag"
              size="small"
              :style="{ color: getTagColor(tag) }"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-card>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <el-button :disabled="currentPage === 1" @click="currentPage--">上一页</el-button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <el-button :disabled="currentPage === totalPages" @click="currentPage++">下一页</el-button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.interview-list {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
}

.page-head h1 {
  margin-bottom: 8px;
}

.page-head p {
  color: #999;
  font-size: 14px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}

.filter-item {
  width: 160px;
}

.skeleton-list el-skeleton {
  margin-bottom: 24px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.interview-card {
  cursor: pointer;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-head h2 {
  margin: 0;
  font-size: 18px;
}

.position {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #999;
  font-size: 13px;
}

.tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
