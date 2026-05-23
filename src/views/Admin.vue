<template>
    <div class="admin-container">
        <h1>后台管理</h1>
        <el-tabs v-model="activeTab">
            <el-tab-pane label="已发布文章" name="published">
                <el-table :data="publishedArticle" stripe>
                    <el-table-column prop="title" label="标题" />
                    <el-table-column prop="category" label="分类" width="120" />
                    <el-table-column prop="createAt" label="创建时间" width="120" />
                    <el-table-column prop="wordCount" label="字数" width="80" />
                    <el-table-column label="操作" width="160">
                        <template #default="{row}">
                            <el-button size="small" @click="editArticle(row.id)">编辑</el-button>
                            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="草稿箱" name="draft">
                <el-table :data="articleManagerStore.drafts" stripe>
                    <el-table-column prop="title" label="标题" />
                    <el-table-column label="最后修改" width="180">
                    <template #default="{ row }">
                        {{ formatTime(row.updatedAt) }}
                    </template>
                    </el-table-column>
                    <el-table-column prop="wordCount" label="字数" width="80" />
                    <el-table-column label="操作" width="160">
                        <template #default="{row}">
                            <el-button size="small" @click="editArticle(row.id)">编辑</el-button>
                            <el-button size="small" type="danger" @click="handleDeleteDraft(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>

    </div>
</template>

<script lang="ts" setup>
import {computed,onMounted,ref} from 'vue'
import { useArticleManagerStore } from '@/stores/articleManager'
import { useBlogStore } from '@/stores/blog'
import { useRouter } from 'vue-router'
import { ElTabs, ElTabPane, ElTable, ElTableColumn, ElButton } from 'element-plus'
import { formatTime } from '@/composables/useComments'



const articleManagerStore = useArticleManagerStore()
const router = useRouter()
const blogStore = useBlogStore()

const publishedArticle = computed(() => {
    return blogStore.articles.filter(a => !a.status || a.status === 'published')
})
// 跳转编辑
const editArticle = (id:number) =>{
    router.push(`/editor?id=${id}`)
}

const activeTab = ref('published')
// 删除已发布文章
const handleDelete = (id:number) =>{
    if(confirm('确定要删除这篇文章吗')){
        blogStore.deleteArticle(id)
    }
}

// 删除草稿
const handleDeleteDraft = (id:number) => {
    if(confirm('确定要删除这个草稿')){
        articleManagerStore.deleteDraft(id)
    }
}

onMounted(() => {
    blogStore.loadArticles()
    articleManagerStore.loadDrafts()
})
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}
</style>