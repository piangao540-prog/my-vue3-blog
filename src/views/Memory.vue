<template>
  <div class="memory-page">
    <template v-if="userStore.isLoggedIn">
      <div class="page-head">
        <h2>我的记忆</h2>
        <p>AI 从对话中自动提炼，也可以手动修正或补充</p>
      </div>

      <el-button type="primary" :icon="Plus" @click="openCreate">手动添加</el-button>

      <el-empty
        v-if="!loading && memories.length === 0"
        description="还没有记忆，先去和 AI 聊聊吧"
      />

      <div v-for="cat in CATEGORIES" :key="cat">
        <template v-if="grouped[cat].length">
          <h3 class="cat-title">{{ cat }}</h3>
          <div class="memory-grid">
            <el-card v-for="m in grouped[cat]" :key="m.id" class="memory-card" shadow="hover">
              <p class="memory-content">{{ m.content }}</p>
              <div class="memory-meta">
                <el-tag size="small" type="info">权重 {{ Number(m.weight).toFixed(2) }}</el-tag>
                <span class="memory-time">{{ formatTime(m.createdAt) }}</span>
              </div>
              <div class="memory-actions">
                <el-button size="small" :icon="Edit" @click="openEdit(m)">编辑</el-button>
                <el-button size="small" type="danger" :icon="Delete" @click="removeMemory(m)"
                  >删除</el-button
                >
              </div>
            </el-card>
          </div>
        </template>
      </div>

      <div class="review-section">
        <h3 class="cat-title">复盘</h3>
        <div class="review-toolbar">
          <el-select v-model="period" style="width: 160px">
            <el-option label="最近 7 天" value="week" />
            <el-option label="最近 30 天" value="month" />
            <el-option label="最近一年" value="year" />
            <el-option label="全部时间" value="all" />
          </el-select>
          <el-button type="primary" :loading="reviewing" @click="generateReview()"
            >生成复盘</el-button
          >
          <el-button v-if="review" :loading="reviewing" @click="generateReview(true)"
            >重新生成</el-button
          >
        </div>
        <div v-if="reviewing" class="review-content review-loading">AI 正在分析你的对话数据...</div>
        <div v-else-if="review" class="review-content" v-html="renderMarkdown(review)"></div>
        <el-empty v-else description="选择时间段，生成一份关于你自己的复盘" />
      </div>

      <div class="review-section">
        <h3 class="cat-title">数据管理</h3>
        <div class="review-toolbar">
          <el-button @click="handleExport('json')">导出 JSON</el-button>
          <el-button @click="handleExport('markdown')">导出 Markdown</el-button>
          <el-button type="danger" @click="handleReset">重置记忆库</el-button>
        </div>
        <el-alert
          type="warning"
          :closable="false"
          show-icon
          title="重置只清除提炼的记忆，原始对话记录会保留"
        />
      </div>

      <el-dialog
        v-model="dialogVisible"
        :title="editingId ? '编辑记忆' : '手动添加记忆'"
        width="480px"
      >
        <el-form label-width="80px">
          <el-form-item label="分类">
            <el-select v-model="form.category">
              <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="4"
              placeholder="这条记忆的内容"
            />
          </el-form-item>
          <el-form-item label="权重">
            <el-slider v-model="form.weight" :min="0" :max="1" :step="0.1" show-input />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="save">保存</el-button>
        </template>
      </el-dialog>
    </template>

    <div v-else class="login-tip">
      <el-empty description="登录后才能查看和管理记忆">
        <el-button type="primary" @click="router.push('/login')">去登录</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { renderMarkdown } from '@/utils/markdown'
import { useUserStore } from '@/stores/user'
import { formatTime } from '@/utils/formatTime'
import {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  getReview,
  resetMemories,
  type MemoryItem,
} from '@/api/memories'
import { exportChats } from '@/api/chat'

const CATEGORIES = ['基础属性', '思维认知', '生活状态', '情绪特征', '专属经历']

const userStore = useUserStore()
const router = useRouter()

const memories = ref<MemoryItem[]>([])
const loading = ref(false)

// 按分类分组
const grouped = computed(() => {
  const map: Record<string, MemoryItem[]> = {}
  for (const c of CATEGORIES) map[c] = []
  for (const m of memories.value) {
    if (!map[m.category]) map[m.category] = []
    map[m.category].push(m)
  }
  return map
})

// 从后端加载记忆
const loadMemories = async () => {
  loading.value = true
  try {
    memories.value = await getMemories()
  } catch {
    ElMessage.error('加载记忆失败')
  } finally {
    loading.value = false
  }
}

// 编辑 / 新增弹窗
const dialogVisible = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ category: '生活状态', content: '', weight: 0.6 })

const openCreate = () => {
  editingId.value = null
  form.value = { category: '生活状态', content: '', weight: 0.6 }
  dialogVisible.value = true
}

const openEdit = (m: MemoryItem) => {
  editingId.value = m.id
  form.value = {
    category: m.category,
    content: m.content,
    weight: Number(m.weight) || 0.5,
  }
  dialogVisible.value = true
}

const save = async () => {
  if (!form.value.content.trim()) {
    ElMessage.warning('内容不能为空')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateMemory(editingId.value, form.value)
    } else {
      await createMemory(form.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    await loadMemories()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const removeMemory = async (m: MemoryItem) => {
  try {
    await deleteMemory(m.id)
    ElMessage.success('已删除')
    await loadMemories()
  } catch {
    ElMessage.error('删除失败')
  }
}

// ===== 复盘 =====
const period = ref('week')
const reviewing = ref(false)
const review = ref('')

// 生成复盘：force=false 优先用缓存，true 强制重新生成
const generateReview = async (force = false) => {
  reviewing.value = true
  try {
    const data = await getReview(period.value, force)
    review.value = data.content
    if (data.cached) {
      ElMessage.info('返回的是 30 分钟内的缓存结果')
    }
  } catch {
    ElMessage.error('生成复盘失败')
  } finally {
    reviewing.value = false
  }
}

// ===== 数据管理 =====
const handleExport = async (format: 'json' | 'markdown') => {
  try {
    await exportChats(format)
  } catch {
    ElMessage.error('导出失败')
  }
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm('确定要清空全部记忆吗？原始对话记录会保留。', '重置确认', {
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await resetMemories()
    ElMessage.success('记忆库已重置')
    memories.value = []
    review.value = ''
  } catch {
    ElMessage.error('重置失败')
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadMemories()
  }
})
</script>

<style scoped>
.memory-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-head {
  margin-bottom: 16px;
}

.page-head h2 {
  margin: 0 0 6px;
}

.page-head p {
  color: #888;
  font-size: 14px;
  margin: 0;
}

.cat-title {
  margin: 24px 0 12px;
  color: #555;
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.memory-card {
  display: flex;
  flex-direction: column;
}

.memory-content {
  min-height: 48px;
  line-height: 1.6;
  margin: 0 0 12px;
  word-break: break-word;
}

.memory-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.memory-time {
  color: #aaa;
  font-size: 12px;
}

.memory-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.login-tip {
  padding-top: 60px;
}

.review-section {
  margin-top: 40px;
}

.review-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.review-content {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px 20px;
  line-height: 1.7;
  font-size: 14px;
}

.review-loading {
  color: #999;
}

/* 复盘内容也是 v-html 注入的，scoped 样式命中不了，必须用 :deep() */
.review-content :deep(h1),
.review-content :deep(h2),
.review-content :deep(h3) {
  margin: 12px 0 8px;
}

.review-content :deep(p) {
  margin: 8px 0;
}

.review-content :deep(ul),
.review-content :deep(ol) {
  margin: 8px 0;
  padding-left: 1.4em;
  list-style: none;
}

.review-content :deep(li) {
  position: relative;
  list-style: none;
}

.review-content :deep(ul) > li::before {
  content: '•';
  position: absolute;
  left: -1em;
  color: #9ca3af;
  font-size: 0.9em;
}

html.dark .review-content {
  background: #1f1f1f;
  border-color: #333;
}
</style>
