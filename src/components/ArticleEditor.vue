<template>
    <div class="article-editor">
        <!-- 工具栏 -->
        <div class="editor-toolbar">
            <el-input v-model="title" placeholder="请输入文章标题" class="title-input">
            </el-input>
            <div class="toolbar-actions">
                <el-button type="primary" @click="$emit('save',content,title)">
                    保存草稿
                </el-button>
                <el-button type="success" @click="$emit('publish',content,title)">
                    发布文章
                </el-button>
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
import { ElButton,ElInput } from 'element-plus'

const props = defineProps<{
    initialContent?: string
    initialTitle?: string
}>()

const emit = defineEmits<{
    save: [content:string,title:string]
    publish: [content:string,title:string]
}>()

const content = ref(props.initialContent ||  '')
const title = ref(props.initialTitle || '')
const wordCount = ref(0)

watch(content,(newContent) => {
    wordCount.value = newContent.length
})
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
