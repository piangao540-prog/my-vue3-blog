<template>
    <div class="memory-page">
        <template v-if="userStore.isLoggedIn">
            <div class="page-head">
                <h2>我的记忆</h2>
                <p>AI 从对话中自动提炼，也可以手动修正或补充</p>
            </div>

            <el-button type="primary" :icon="Plus" @click="openCreate">手动添加</el-button>

            <el-empty v-if="!loading && memories.length === 0" description="还没有记忆，先去和 AI 聊聊吧" />

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
                                <el-button size="small" type="danger" :icon="Delete" @click="removeMemory(m)">删除</el-button>
                            </div>
                        </el-card>
                    </div>
                </template>
            </div>

            <el-dialog v-model="dialogVisible" :title="editingId ? '编辑记忆' : '手动添加记忆'" width="480px">
                <el-form label-width="80px">
                    <el-form-item label="分类">
                        <el-select v-model="form.category">
                            <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="内容">
                        <el-input v-model="form.content" type="textarea" :rows="4" placeholder="这条记忆的内容" />
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
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { formatTime } from '@/utils/formatTime'
import {
    getMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    type MemoryItem
} from '@/api/memories'

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
        weight: Number(m.weight) || 0.5
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
</style>
