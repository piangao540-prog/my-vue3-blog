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
                <div v-loading="analyticsLoading" style="min-height: 200px;">
                    <div class="chart-card">
                        <div ref="chartRef" style="width:100%;height:400px"></div>
                    </div>
                    <div class="chart-card" style="margin-top:20px">
                        <div ref="barRef" style="width:100%;height:300px"></div>
                    </div>
                    <div class="chart-card" style="margin-top:20px">
                        <div ref="pieRef" style="width:100%;height:300px"></div>
                    </div>
                </div>
            </el-tab-pane>

        </el-tabs>

    </div>
</template>

<script lang="ts" setup>
import {computed,onMounted,onUnmounted,ref,watch,nextTick} from 'vue'
import { useArticleManagerStore } from '@/stores/articleManager'
import { useBlogStore } from '@/stores/blog'
import { useRouter } from 'vue-router'
import { ElTabs, ElTabPane, ElButton } from 'element-plus'
import { formatTime } from '@/composables/useComments'
import { useUserStore } from '@/stores/user'
import { getAnalyticsSummary } from '@/api/analytics'
import BaseTable from '@/components/BaseTable.vue'
// echarts图
import * as echarts from 'echarts'


const analytics = ref<{ pages: any[], daily: any[] }>({ pages: [], daily: [] })
const userStore = useUserStore()
const articleManagerStore = useArticleManagerStore()
const router = useRouter()
const blogStore = useBlogStore()
const activeTab = ref('published')
const analyticsLoading = ref(false)


// 数据概括
const loadAnalytics = async () => {
    analyticsLoading.value = true
    analytics.value = await getAnalyticsSummary()
    analyticsLoading.value = false
}

// echarts图
const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
const barRef = ref<HTMLDivElement | null>(null)
let barChart: echarts.ECharts | null = null
const pieRef = ref<HTMLDivElement | null>(null)
let pieChart: echarts.ECharts | null = null

// 每日图
const initChart = () => {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    const days =  analytics.value.daily.map(item => item.day).reverse()
    const counts = analytics.value.daily.map(item => item.count).reverse()
    const option = {
        title: {text:'每日访问趋势', left:'center', top:10},
        tooltip: {trigger: 'axis'},
        grid: { top:50, bottom:30 },
        xAxis: {data: days},
        yAxis: {name:'次数'},
        series: [{
            type: 'line', 
            data:counts,
            smooth: true,
            lineStyle: {width: 3},
            symbol: 'circle',
            symbolSize: 8,
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0,0,0,1,[
                    {offset: 0, color: 'rgba(64,158,255,0.3)'},
                    {offset: 1, color: 'rgba(64,158,255,0.05)' }
                ])
            }
        }]
    }
    chart.setOption(option)
}
// 热门图
const initBarChart =  () => {
    if(!barRef.value || !analytics.value.pages) return
    barChart = echarts.init(barRef.value)
    const pages = analytics.value.pages.map(item => displayPage(item.page))
    const counts = analytics.value.pages.map(item => item.count)
    const option = {
        title: {text:'热门页面', left:'center', top:10},
        tooltip: {trigger: 'axis'},
        grid: { top:50, bottom:50 },
        xAxis: {data: pages, axisLabel:{interval:0}},
        yAxis: {name:'次数'},
        series: [{
            type: 'bar',
            data: counts,
            barWidth: '60%',
            itemStyle: {
                borderRadius: [4,4,0,0],
                color: new echarts.graphic.LinearGradient(0,0,0,1,[
                    {offset: 0,color:'#83bff6'},
                    {offset: 1, color: '#188df0'}
                ])
            }
        }]
    }
    barChart.setOption(option)
}
// 占比饼状图
const initpieChart = () =>{
    if(!pieRef.value || !analytics.value.pages) return
    pieChart = echarts.init(pieRef.value)
    const data = analytics.value.pages.map(item => ({
        name: displayPage(item.page),
        value: item.count
    }))
    const option = {
        title: {text:'页面访问占比', left:'center', top:10},
        tooltip: { trigger: 'item', formatter: '{b}: {c}次 ({d}%)' },
        legend: {
            orient: 'vertical',
            left: '65%',
            top: 'middle'
        },
        series: [{
            type: 'pie',
            radius: ['40%', '65%'],
            center: ['30%', '55%'],
            label: {
                show: true,
                formatter: '{d}%',
                position: 'inside',
                fontSize: 13,
                fontWeight: 'bold',
                color: '#fff'
            },
            labelLine: { show: false },
            data
        }]
    }
    pieChart.setOption(option)
}



watch(activeTab,async (tab) => {
    if (tab === 'analytics') {
        await nextTick()
        if (!chart) initChart()
        if (!barChart) initBarChart()
        if (!pieChart) initpieChart()
    }
})

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


onMounted(async () => {
    await blogStore.loadArticles()
    await articleManagerStore.loadDrafts()
    await loadAnalytics()
})

const handleResize = () => {
    chart?.resize()
    barChart?.resize()
    pieChart?.resize()
}
onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
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

.chart-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    padding: 10px;
}
</style>