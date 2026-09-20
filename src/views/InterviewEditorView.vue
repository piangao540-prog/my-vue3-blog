<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '../../node_modules/@kangc/v-md-editor/lib/theme/style/github.css'
import hljs from '@/utils/highlight'
import {
  createInterview,
  updateInterview,
  deleteInterview,
  getInterviewRaw,
} from '@/api/interview'
import { RESULT_OPTIONS } from '@/stores/interview'
import type { InterviewPayload, InterviewResult } from '@/stores/interview'

VMdEditor.use(githubTheme, { Hljs: hljs })

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const interviewId = ref<number>()
const saving = ref(false)
const loading = ref(false)

const form = reactive({
  company: '',
  company_public: '',
  position: '',
  channel: '',
  result: 'ongoing' as InterviewResult,
  interview_date: '' as string,
  questions: '',
  content: '',
})

const tags = ref<string[]>([])
const newTag = ref('')

const rules: FormRules = {
  company: [{ required: true, message: '填真实公司名，仅自己可见', trigger: 'blur' }],
  company_public: [{ required: true, message: '填对外展示的脱敏名', trigger: 'blur' }],
  position: [{ required: true, message: '填应聘岗位', trigger: 'blur' }],
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
  }
  newTag.value = ''
}

const removeTag = (tag: string) => {
  tags.value = tags.value.filter((item) => item !== tag)
}

const buildPayload = (status: 'draft' | 'published'): InterviewPayload => ({
  company: form.company,
  company_public: form.company_public,
  position: form.position,
  channel: form.channel,
  result: form.result,
  interview_date: form.interview_date || null,
  tags: tags.value,
  questions: form.questions,
  content: form.content,
  status,
})

const handleSave = async (status: 'draft' | 'published') => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (interviewId.value) {
      await updateInterview(interviewId.value, buildPayload(status))
    } else {
      const created = await createInterview(buildPayload(status))
      interviewId.value = created.id
    }
    ElMessage.success(status === 'draft' ? '草稿已保存' : '面经已发布')
    if (status === 'published') {
      router.push('/interviews')
    }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!interviewId.value) return
  const confirmed = await ElMessageBox.confirm('删除后无法恢复，确定删除这篇面经吗？', '删除面经', {
    type: 'warning',
  }).catch(() => false)
  if (!confirmed) return

  try {
    await deleteInterview(interviewId.value)
    ElMessage.success('已删除')
    router.push('/interviews')
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(async () => {
  const id = Number(route.query.id)
  if (!Number.isInteger(id)) return

  loading.value = true
  try {
    // 走 /raw 才能拿到真实公司名，公开接口只给脱敏名
    const raw = await getInterviewRaw(id)
    interviewId.value = id
    form.company = raw.company
    form.company_public = raw.company_public
    form.position = raw.position
    form.channel = raw.channel || ''
    form.result = raw.result
    form.interview_date = raw.interview_date || ''
    form.questions = raw.questions || ''
    form.content = raw.content || ''
    tags.value = raw.tags
  } catch {
    ElMessage.error('面经加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="interview-editor" v-loading="loading">
    <el-button link @click="router.push('/interviews')">
      <el-icon>
        <ArrowLeft />
      </el-icon>
      返回面经列表
    </el-button>

    <h1>{{ interviewId ? '编辑面经' : '写面经' }}</h1>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="公司真名" prop="company">
        <el-input v-model="form.company" placeholder="真实公司名，只存库不外发" />
      </el-form-item>

      <el-form-item label="对外展示名" prop="company_public">
        <el-input v-model="form.company_public" placeholder="例如：某电商大厂、某中厂" />
        <div class="hint">访客看到的只有这一个名字，粒度别细到能被定位</div>
      </el-form-item>

      <el-form-item label="岗位" prop="position">
        <el-input v-model="form.position" placeholder="例如：前端开发实习生" />
      </el-form-item>

      <el-form-item label="投递渠道">
        <el-input v-model="form.channel" placeholder="BOSS / 官网 / 内推" />
      </el-form-item>

      <el-form-item label="面试结果">
        <el-select v-model="form.result" style="width: 200px">
          <el-option
            v-for="option in RESULT_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="面试日期">
        <el-date-picker
          v-model="form.interview_date"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="技术栈标签">
        <div class="tag-editor">
          <el-tag
            v-for="tag in tags"
            :key="tag"
            closable
            size="small"
            @close="removeTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-model="newTag"
            size="small"
            class="tag-input"
            placeholder="输入后回车"
            @keyup.enter="addTag"
          />
          <el-button size="small" :icon="Plus" @click="addTag">添加</el-button>
        </div>
      </el-form-item>

      <el-form-item label="面试题">
        <el-input
          v-model="form.questions"
          type="textarea"
          :rows="8"
          placeholder="支持 markdown，一条一行或用列表写"
        />
        <div class="hint">读者最想看的就是这块，会单独成块展示在正文前面</div>
      </el-form-item>
    </el-form>

    <div class="content-editor">
      <span class="section-label">面试复盘</span>
      <v-md-editor v-model="form.content" mode="edit" height="400px" />
    </div>

    <div class="actions">
      <el-button :loading="saving" @click="handleSave('draft')">保存草稿</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave('published')">
        发布
      </el-button>
      <el-button v-if="interviewId" type="danger" plain @click="handleDelete">删除</el-button>
    </div>
  </div>
</template>

<style scoped>
.interview-editor {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.hint {
  color: #999;
  font-size: 12px;
  line-height: 1.6;
}

.tag-editor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tag-input {
  width: 140px;
}

.content-editor {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
}
</style>
