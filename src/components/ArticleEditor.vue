<template>
  <div class="article-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <el-input v-model="title" placeholder="请输入文章标题" class="title-input"> </el-input>
      <div class="toolbar-actions">
        <el-button @click="triggerUpload" :loading="uploading">插入图片</el-button>
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          style="display: none"
          @change="handleFileChange"
        />
        <el-button type="primary" @click="handleSave"> 保存草稿 </el-button>
        <el-button type="success" @click="handlePublish"> 发布文章 </el-button>
        <span class="word-count">字数：{{ wordCount }}</span>
      </div>
    </div>
    <div class="editor-tags">
      <div class="tag-row">
        <span class="tag-label">标签：</span>
        <el-button size="small" @click="aiRecommendTags" :loading="aiLoading">
          AI推荐标签
        </el-button>
        <el-input
          v-model="newTag"
          placeholder="手动输入"
          size="small"
          class="tag-input"
          @keyup.enter="addManualTag"
        />
      </div>
      <div v-if="suggestedTags.length" class="suggested-row">
        <span class="tab-label">推荐：</span>
        <el-tag
          v-for="tag in suggestedTags"
          :key="tag"
          type="warning"
          style="cursor: pointer"
          @click="addSuggestedTag(tag)"
        >
          +{{ tag }}
        </el-tag>
      </div>
    </div>
    <!-- 编辑区域 -->
    <div class="editor-main">
      <div class="editor-pane">
        <v-md-editor v-model="content" mode="edit" height="500px" />
      </div>
      <div class="preview-pane">
        <v-md-editor v-model="content" mode="preview" height="500px" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ElButton, ElInput, ElMessage } from 'element-plus'
import { useArticleManagerStore } from '@/stores/articleManager'
import { getAiTags } from '@/api/ai'
import { uploadImage } from '@/api/upload'
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '../../node_modules/@kangc/v-md-editor/lib/theme/style/github.css'
import hljs from 'highlight.js'
VMdEditor.use(githubTheme, { Hljs: hljs })

const props = defineProps<{
  initialContent?: string
  initialTitle?: string
  initialTags?: string[]
  articleId?: number
}>()

const emit = defineEmits(['save', 'publish'])

const tags = ref<string[]>(props.initialTags || [])
const newTag = ref('')
const suggestedTags = ref<string[]>([])
const aiLoading = ref(false)

const articleManageStore = useArticleManagerStore()
const content = ref(props.initialContent || '')
const title = ref(props.initialTitle || '')
const wordCount = ref(0)

watch(content, (newContent) => {
  wordCount.value = articleManageStore.calculateWordCount(newContent)
})

// 直接写属性名监听不行，函数形式能实时取最新 props 值
watch(
  () => props.initialContent,
  (newVal) => {
    if (newVal) content.value = newVal
  },
)

watch(
  () => props.initialTitle,
  (newVal) => {
    if (newVal) title.value = newVal
  },
)

watch(
  () => props.initialTags,
  (newVal) => {
    if (newVal) tags.value = [...newVal]
  },
)

// 保存草稿

// 图片上传:选图 → canvas 压缩 → 传后端 → 插入 Markdown
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const triggerUpload = () => {
  fileInput.value?.click()
}

const compressImage = (file: File, maxSize = 900, quality = 0.75) => {
  return new Promise<{ data: string; mime: string }>((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('浏览器不支持 canvas'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      // PNG 保留透明,其他转 JPEG 压缩
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const dataUrl = canvas.toDataURL(
        outputType,
        outputType === 'image/jpeg' ? quality : undefined,
      )
      resolve({
        data: dataUrl.split(',')[1],
        mime: dataUrl.split(';')[0].split(':')[1],
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('图片加载失败'))
    }
    img.src = objectUrl
  })
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    ElMessage.error('不支持的图片类型')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片超过 5MB')
    return
  }

  uploading.value = true
  try {
    const { data, mime } = await compressImage(file)
    if (data.length > 2000000) {
      throw new Error('图片压缩后仍过大,请换一张小图')
    }
    const url = await uploadImage(data, mime)
    content.value += `\n![图片](${url})\n`
    ElMessage.success('图片已插入')
  } catch (err: any) {
    ElMessage.error(err?.message || '上传失败,请重试')
  } finally {
    uploading.value = false
  }
}
const handleSave = () => {
  emit('save', content.value, title.value, tags.value)
}

// 发布文章
const handlePublish = () => {
  emit('publish', content.value, title.value, tags.value)
}

const aiRecommendTags = async () => {
  if (!content.value) {
    ElMessage.warning('请先写文章内容')
    return
  }
  aiLoading.value = true
  try {
    const result = await getAiTags(content.value, title.value)
    suggestedTags.value = result
  } catch {
    ElMessage.error('推荐失败，请重试')
  } finally {
    aiLoading.value = false
  }
}

const addManualTag = () => {
  const tag = newTag.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
  }
  newTag.value = ''
}

const addSuggestedTag = (tag: string) => {
  if (!tags.value.includes(tag)) {
    tags.value.push(tag)
  }
}
</script>

<style scoped>
.article-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-input {
  flex: 1;
  max-width: 400px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.word-count {
  color: #666;
  font-size: 14px;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-pane,
.preview-pane {
  flex: 1;
  border-right: 1px solid #eee;
}

.preview-pane {
  border-right: none;
}
</style>
