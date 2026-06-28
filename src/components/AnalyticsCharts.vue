<template>
    <div>
        <div style="display:flex;gap:20px;margin-bottom:20px">
            <el-card style="flex:1">
                <p style="font-size:12px;color:#999">总文章数</p>
                <p style="font-size:24px;font-weight:bold;color:#409eff">
                    {{ blogStore.articles.length }}
                </p>
            </el-card>
            <el-card style="flex:1">
                <p style="font-size:12px;color:#999">草稿数</p>
                <p style="font-size:24px;font-weight:bold;color:#e6a23c">
                    {{ articleManagerStore.drafts.length }}
                </p>
            </el-card>
            <el-card style="flex:1">
                <p style="font-size:12px;color:#999">总访问量</p>
                <p style="font-size:24px;font-weight:bold;color:#67c23a">
                    {{ totalViews }}
                </p>
            </el-card>
        </div>

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
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useBlogStore } from '@/stores/blog'
import { useArticleManagerStore } from '@/stores/articleManager'
import { getAnalyticsSummary } from '@/api/analytics'
import * as echarts from 'echarts'

const blogStore = useBlogStore()
const articleManagerStore = useArticleManagerStore()

const analytics = ref<{ pages: any[], daily: any[] }>({ pages: [], daily: [] })

const loadAnalytics = async () => {
    analytics.value = await getAnalyticsSummary()
}

const totalViews = computed(() => {
    return blogStore.articles.reduce((sum, a) => sum + (a.views || 0), 0)
})

// echarts图
const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
const barRef = ref<HTMLDivElement | null>(null)
let barChart: echarts.ECharts | null = null
const pieRef = ref<HTMLDivElement | null>(null)
let pieChart: echarts.ECharts | null = null

const displayPage = (page: string) => {
    const m = page.match(/^\/articles\/(\d+)$/)
    if (m) {
        const article = blogStore.articles.find(a => a.id === Number(m[1]))
        if (article) return article.title
    }
    const names: Record<string, string> = { '/': '首页', '/admin': '后台管理', '/profile': '个人中心', '/articles': '文章列表', '/archive': '归档', '/about': '关于' }
    return names[page] || page
}

// 每日图
const initChart = () => {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    const days = analytics.value.daily.map(item => item.day).reverse()
    const counts = analytics.value.daily.map(item => item.count).reverse()
    const option = {
        title: { text: '每日访问趋势', left: 'center', top: 10 },
        tooltip: { trigger: 'axis' },
        grid: { top: 50, bottom: 30 },
        xAxis: { data: days },
        yAxis: { name: '次数' },
        series: [{
            type: 'line',
            data: counts,
            smooth: true,
            lineStyle: { width: 3 },
            symbol: 'circle',
            symbolSize: 8,
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(64,158,255,0.3)' },
                    { offset: 1, color: 'rgba(64,158,255,0.05)' }
                ])
            }
        }]
    }
    chart.setOption(option)
}

// 热门图
const initBarChart = () => {
    if (!barRef.value || !analytics.value.pages) return
    barChart = echarts.init(barRef.value)
    const pages = analytics.value.pages.map(item => displayPage(item.page))
    const counts = analytics.value.pages.map(item => item.count)
    const option = {
        title: { text: '热门页面', left: 'center', top: 10 },
        tooltip: { trigger: 'axis' },
        grid: { top: 50, bottom: 50 },
        xAxis: { data: pages, axisLabel: { interval: 0 } },
        yAxis: { name: '次数' },
        series: [{
            type: 'bar',
            data: counts,
            barWidth: '60%',
            itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 1, color: '#188df0' }
                ])
            }
        }]
    }
    barChart.setOption(option)
}

// 占比饼状图
const initpieChart = () => {
    if (!pieRef.value || !analytics.value.pages) return
    pieChart = echarts.init(pieRef.value)
    const data = analytics.value.pages.map(item => ({
        name: displayPage(item.page),
        value: item.count
    }))
    const option = {
        title: { text: '页面访问占比', left: 'center', top: 10 },
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

onMounted(async () => {
    await loadAnalytics()

    const observer = new ResizeObserver(() => {
        if (chartRef.value?.offsetWidth) {
            initChart()
            initBarChart()
            initpieChart()
            observer.disconnect()
        }
    })
    if (chartRef.value) observer.observe(chartRef.value)
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
.chart-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    padding: 10px;
}
</style>
