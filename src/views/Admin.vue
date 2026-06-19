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
                <div v-if="!analytics.pages" class="empty-tip">暂无数据</div>
                <div v-else>
                    <h3>每日访问趋势</h3>
                    <ul class="analytics-list daily">
                        <li v-for="item in analytics.daily" :key="item.day" class="analytics-item">
                            <span class="analytics-page">{{ item.day }}</span>
                            <span class="analytics-count">{{ item.count }} 次</span>
                        </li>
                    </ul>
                    <h3>热门页面</h3>
                    <ul class="analytics-list">
                        <li v-for="item in analytics.pages" :key="item.page" class="analytics-item">
                            <span class="analytics-page">{{ displayPage(item.page) }}</span>
                            <span class="analytics-count">{{ item.count }} 次访问</span>
                        </li>
                    </ul>
                </div>
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
import { getAnalyticsSummary } from '@/api/analytics'
import BaseTable from '@/components/BaseTable.vue'


const analytics = ref<{ pages: any[], daily: any[] }>({ pages: [], daily: [] })
const userStore = useUserStore()
const articleManagerStore = useArticleManagerStore()
const router = useRouter()
const blogStore = useBlogStore()

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

const activeTab = ref('published')
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

// 页面路径转标题
const displayPage = (page: string) => {
    const m = page.match(/^\/articles\/(\d+)$/)
    if (m) {
        const article = blogStore.articles.find(a => a.id === Number(m[1]))
        if (article) return article.title
    }
    const names: Record<string, string> = { '/': '首页', '/admin': '后台管理', '/profile': '个人中心', '/articles': '文章列表', '/archive': '归档', '/about': '关于' }
    return names[page] || page
}

// 数据概括
const loadAnalytics = async () => {
    analytics.value = await getAnalyticsSummary()
}

onMounted(async () => {
    await blogStore.loadArticles()
    await articleManagerStore.loadDrafts()
    await loadAnalytics()
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

.empty-tip { 
    color: #999; text-align: center; padding: 40px 0; 
}

.analytics-list { 
    list-style: none; padding: 0;
}

.analytics-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.analytics-page { 
    font-size: 14px; color: #333; 
}

.analytics-count { 
    font-size: 14px; color: #e86f83; font-weight: 600; 
}

</style>