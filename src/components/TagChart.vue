<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useBlogStore } from '@/stores/blog';
// 引入echarts
import * as echarts from 'echarts'
let chart: echarts.ECharts | null = null

// 封装自动绑定和解绑的 resize 逻辑
const useChartResize = () => {
    const resize = () => chart?.resize()
    onMounted(() => window.addEventListener('resize', resize))
    onUnmounted(() => window.removeEventListener('resize', resize))
}
const blogStore = useBlogStore()
const chartRef = ref<HTMLDivElement | null>(null)
const tagStats = computed(() => {
    const count: Record<string, number> = {}
    blogStore.articles.forEach(article => {
        article.tags.forEach(tag => {
            count[tag] = (count[tag] || 0) + 1
        })
    })
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 5)

    return sorted.map(([name, value]) => ({ value, name }))
})
// 初始化图标
const updateChart = () => {
    if (!chart || !chartRef.value) return

    const option = {
        legend: {
            orient: 'horizontal',
            bottom: '0',
            textStyle: { fontSize: 11 },
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 8
        },
        series: [{
            type: 'pie',
            radius: ['13%', '45%'],
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
                borderRadius: 5,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: { fontSize: false },
            emphasis: {
                label: { show: true, fontSize: 10, fontWeight: 'bold' }
            },
            data: tagStats.value
        }],
        tooltip: {
            trigger: 'item',
            textStyle: { fontSize: 10 },
            padding: [6, 10],
            formatter: '{b}:{c}篇文章({d}%)'
        }
    }

    chart.setOption(option, true)
}

onMounted(() => {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    updateChart()
    useChartResize()
})

watch(
    () => blogStore.articles,
    () => {
        updateChart()
    },
    { deep: true }
)

onUnmounted(() => {
    chart?.dispose()
})
</script>

<template>
    <div ref="chartRef" style="width: 100%; height: 300px;"></div>
</template>