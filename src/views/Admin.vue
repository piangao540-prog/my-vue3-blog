<template>
    <div class="admin-container">
        <h1>后台管理</h1>
        <el-tabs v-model="activeTab">
            <el-tab-pane label="已发布文章" name="published">
                <BaseTable :columns="publishedColumns" :data="publishedArticle" stripe>
                    <template #createdAt="{ row }">
                        {{ formatTime(row.createdAt) }}
                    </template>

                    <template #count="{ row }">
                        {{ articleManagerStore.calculateWordCount(row.content) || '-' }}
                    </template>
                    <template #action="{row}" v-if="userStore.isAdmin">
                        <el-button size="small" @click="editArticle(row.id)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
                    </template>
                </BaseTable>
            </el-tab-pane>
            <el-tab-pane label="草稿箱" name="draft">
                <BaseTable :columns="draftColumns" :data="articleManagerStore.drafts" stripe>
                    <template #updatedAt="{ row }">
                        {{ formatTime(row.updatedAt) }}
                    </template>

                    <template #wordCount="{ row }">
                        {{ articleManagerStore.calculateWordCount(row.content) || '-' }}
                    </template>

                    <template #work="{row}" v-if="userStore.isAdmin">
                        <el-button size="small" @click="editArticle(row.id)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDeleteDraft(row.id)">删除</el-button>
                    </template>

                </BaseTable>
            </el-tab-pane>
            <el-tab-pane label="数据统计" name="analytics">
                <AnalyticsCharts />
            </el-tab-pane>

        </el-tabs>

    </div>
</template>

<script lang="ts" setup>
import {computed,onMounted,ref} from 'vue'
import { useArticleManagerStore } from '@/stores/articleManager'
import { useBlogStore } from '@/stores/blog'
import { useRouter } from 'vue-router'
import { ElTabs, ElTabPane, ElButton } from 'element-plus'
import { formatTime } from '@/composables/useComments'
import { useUserStore } from '@/stores/user'
import BaseTable from '@/components/BaseTable.vue'
import AnalyticsCharts from '@/components/AnalyticsCharts.vue'


const userStore = useUserStore()
const articleManagerStore = useArticleManagerStore()
const router = useRouter()
const blogStore = useBlogStore()
const activeTab = ref('published')

const publishedColumns = [
    {prop:'title', label: '标题'},
    {prop:'category', label:'分类', width:120},
    {label:'字数',width:80, slot:'count'},
    {label:'创建时间', width:140, slot:'createdAt'},
    {label:'操作',width:160, slot:'action'}
]

const draftColumns = [
    {prop:'title', label:'标题'},
    {label:'最后修改', width:180, slot:'updatedAt'},
    {label:'字数', width:80, slot:'wordCount'},
    {label:'操作', width:160, slot:'work'}
]

const publishedArticle = computed(() => {
    return blogStore.articles.filter(a => !a.status || a.status === 'published')
})
// 跳转编辑
const editArticle = (id:number) =>{
    router.push(`/editor?id=${id}`)
}


// 删除已发布文章
const handleDelete = async (id:number) =>{
    if(confirm('确定要删除这篇文章吗')){
       await blogStore.deleteArticle(id)
    }
}

// 删除草稿
const handleDeleteDraft = async (id:number) => {
    if(confirm('确定要删除这个草稿')){
        await articleManagerStore.deleteDraft(id)
    }
}

onMounted(async () => {
    await blogStore.loadArticles()
    await articleManagerStore.loadDrafts()
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