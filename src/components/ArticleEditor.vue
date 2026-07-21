<template>
    <div class="article-editor">
        <!-- 工具栏 -->
        <div class="editor-toolbar">
            <el-input v-model="title" placeholder="请输入文章标题" class="title-input">
            </el-input>
            <div class="toolbar-actions">
                <el-button type="primary" @click="handleSave">
                    保存草稿
                </el-button>
                <el-button type="success" @click="handlePublish">
                    发布文章
                </el-button>
                <span class="word-count">字数：{{ wordCount }}</span>
            </div>
        </div>
        <div class="editor-tags">
            <div class="tag-row">
                <span class="tag-label">标签：</span>
                <el-button size="small" @click="aiRecommendTags" :loading="aiLoading">
                    AI推荐标签
                </el-button>
                <el-input v-model="newTag" placeholder="手动输入" size="small" class="tag-input"
                @keyup.enter="addManualTag" />
            </div>
            <div v-if="suggestedTags.length" class="suggested-row">
                <span class="tab-label">推荐：</span>
                <el-tag v-for="tag in suggestedTags" :key="tag" type="warning"
                style="cursor: pointer;" @click="addSuggestedTag(tag)">
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
import {ref, watch} from 'vue'
import { ElButton,ElInput, ElMessage } from 'element-plus'
import { useArticleManagerStore } from '@/stores/articleManager'
import {getAiTags} from '@/api/ai'
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
const content = ref(props.initialContent ||  '')
const title = ref(props.initialTitle || '')
const wordCount = ref(0)

watch(content,(newContent) => {
    wordCount.value = articleManageStore.calculateWordCount(newContent)
})

// 直接写属性名监听不行，函数形式能实时取最新 props 值
watch(() => props.initialContent, (newVal) => {
    if(newVal) content.value = newVal
})

watch(() => props.initialTitle, (newVal) => {
    if (newVal) title.value = newVal
})

watch(() => props.initialTags, (newVal) => {
    if (newVal) tags.value = [...newVal]
})

// 保存草稿
const handleSave = () => {
    emit('save',content.value,title.value,tags.value)
}

// 发布文章 
const handlePublish = ()  => {
    emit('publish',content.value,title.value,tags.value)
    
}

const aiRecommendTags = async () => {
    if(!content.value){
        ElMessage.warning('请先写文章内容')
        return
    }
    aiLoading.value = true
    try{
        const result = await getAiTags(content.value,title.value)
        suggestedTags.value = result
    }catch{
        ElMessage.error('推荐失败，请重试')
    }finally{
        aiLoading.value = false
    }
}

const addManualTag = () => {
    const tag = newTag.value.trim()
    if(tag && !tags.value.includes(tag)){
        tags.value.push(tag)
    }
    newTag.value = ''
}

const addSuggestedTag = (tag:string) => {
    if(!tags.value.includes(tag)){
        tags.value.push(tag)
    }
}

const removeTag = (i:number) => {
    tags.value.splice(i,1)
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
