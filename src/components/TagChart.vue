<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBlogStore } from '@/stores/blog';
// 引入echarts
import * as echarts from 'echarts'

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
onMounted(() => {
    if (!chartRef.value) return
    // 创建图表实例
    const chart = echarts.init(chartRef.value)
    // 配置图标
    const option = {
        legend: {
            orient: 'horizontal',
            bottom: '0',
            textStyle: {
                fontSize: 11
            },
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 8
        },
        series: [
            {
                type: 'pie',
                radius: ['20%', '40%'],
                center: ['50%', '50%'],
                roseType: 'area',

                // 图形的设置
                itemStyle: {
                    borderRadius: 2,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                // 标签
                label: {
                    fontSize: false
                },
                // 重点提示样式
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 10,
                        fontWeight: 'bold'
                    }
                },
                data: tagStats.value
            }
        ],
        // 弹出来的提示图
        tooltip: {
            trigger: 'item',
            textStyle: {
                fontSize: 10
            },
            padding: [6, 10],
            formatter: '{b}:{c}篇文章({d}%)'
        },
    }
    chart.setOption(option)
    window.addEventListener('resize', () => {
        chart.resize()
    })
})
</script>

<template>
    <div ref="chartRef" style="width: 100%; height: 300px;"></div>
</template>