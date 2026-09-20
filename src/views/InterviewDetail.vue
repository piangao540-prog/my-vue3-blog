<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getTagColor } from '@/composables/useTagColor'
import { renderMarkdown } from '@/utils/markdown'
import { incrementInterviewViews } from '@/api/interview'
import { useInterviewStore, RESULT_LABELS, RESULT_TAG_TYPES } from '@/stores/interview'
import type { Interview } from '@/stores/interview'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()

const interview = ref<Interview>()
const loading = ref(true)

const questionsHtml = computed(() =>
  interview.value?.questions ? renderMarkdown(interview.value.questions) : '',
)
const contentHtml = computed(() =>
  interview.value?.content ? renderMarkdown(interview.value.content) : '',
)

onMounted(async () => {
  const id = Number(route.params.id)
  if (!Number.isInteger(id)) {
    loading.value = false
    return
  }
  try {
    interview.value = await interviewStore.getInterviewById(id)
    if (interview.value) {
      await incrementInterviewViews(id)
    }
  } catch {
    ElMessage.error('面经加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="interview-detail">
    <el-button link @click="router.push('/interviews')">
      <el-icon>
        <ArrowLeft />
      </el-icon>
      返回面经列表
    </el-button>

    <el-skeleton v-if="loading" animated>
      <template #template>
        <el-skeleton-item variant="h1" style="width: 40%; margin: 20px 0" />
        <el-skeleton-item variant="text" style="width: 60%" />
      </template>
    </el-skeleton>

    <el-empty v-else-if="!interview" description="这篇面经不存在或还没发布" />

    <article v-else class="interview-main">
      <header class="interview-header">
        <div class="title-row">
          <h1>{{ interview.company }}</h1>
          <el-tag :type="RESULT_TAG_TYPES[interview.result]" effect="dark">
            {{ RESULT_LABELS[interview.result] }}
          </el-tag>
        </div>

        <div class="meta">
          <span>{{ interview.position }}</span>
          <span v-if="interview.interview_date">{{ interview.interview_date }}</span>
          <span v-if="interview.channel">{{ interview.channel }}</span>
          <span>{{ interview.views }} 次浏览</span>
        </div>

        <div v-if="interview.tags.length" class="tags">
          <el-tag
            v-for="tag in interview.tags"
            :key="tag"
            size="small"
            :style="{ color: getTagColor(tag) }"
          >
            {{ tag }}
          </el-tag>
        </div>
      </header>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="为保护隐私，公司名已做脱敏处理"
        class="privacy-note"
      />

      <section v-if="questionsHtml" class="questions-block">
        <h2>面试题</h2>
        <div class="markdown-body" v-html="questionsHtml"></div>
      </section>

      <section v-if="contentHtml" class="review-block">
        <h2>面试复盘</h2>
        <div class="markdown-body" v-html="contentHtml"></div>
      </section>
    </article>
  </div>
</template>

<style scoped>
.interview-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.interview-header {
  margin: 16px 0 24px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-row h1 {
  margin: 0;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
  color: #999;
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.privacy-note {
  margin-bottom: 24px;
}

.questions-block,
.review-block {
  margin-bottom: 32px;
}

.questions-block h2,
.review-block h2 {
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid var(--el-color-primary);
}

/* v-html 渲染出来的内容拿不到 scoped 属性，必须用 :deep 才匹配得到 */
.markdown-body :deep(h2) {
  margin: 24px 0 12px;
  font-size: 20px;
}

.markdown-body :deep(h3) {
  margin: 20px 0 10px;
  font-size: 17px;
}

.markdown-body :deep(p) {
  margin: 12px 0;
  line-height: 1.8;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 24px;
}

.markdown-body :deep(li) {
  margin: 6px 0;
  line-height: 1.8;
}

.markdown-body :deep(pre) {
  padding: 12px 16px;
  overflow-x: auto;
  border-radius: 6px;
  background: #f6f8fa;
}

.markdown-body :deep(code) {
  font-family: 'Fira Code', Consolas, Monaco, monospace;
}

.markdown-body :deep(blockquote) {
  margin: 12px 0;
  padding: 4px 16px;
  border-left: 3px solid #dcdfe6;
  color: #666;
}

.markdown-body :deep(img) {
  max-width: 100%;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 8px 12px;
  border: 1px solid #ebeef5;
  text-align: left;
}
</style>
