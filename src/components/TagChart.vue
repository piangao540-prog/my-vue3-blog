<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useBlogStore } from '@/stores/blog'
// 引入echarts
import * as echarts from 'echarts'
let chart: echarts.ECharts | null = null

const resize = () => chart?.resize()
const blogStore = useBlogStore()
const chartRef = ref<HTMLDivElement | null>(null)
const tagStats = computed(() => {
  const count: Record<string, number> = {}
  blogStore.articles.forEach((article) => {
    article.tags.forEach((tag) => {
      count[tag] = (count[tag] || 0) + 1
    })
  })
  const sorted = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

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
      itemGap: 8,
    },
    series: [
      {
        type: 'pie',
        // 半径收一点，给两侧标签留出确定的余量
        radius: ['13%', '40%'],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2,
        },
        // 标签限定最大宽度并允许截断，这样它占的宽度是固定值，
        // 不会因为标签变长而顶出画布——手机和 PC 用同一套配置，不需要判断屏幕宽度。
        label: {
          fontSize: 11,
          width: 69,
          overflow: 'truncate',
        },
        labelLine: {
          length: 8,
          length2: 8,
        },
        emphasis: {
          label: { show: true, fontSize: 10, fontWeight: 'bold' },
        },
        data: tagStats.value,
      },
    ],
    tooltip: {
      trigger: 'item',
      textStyle: { fontSize: 10 },
      padding: [6, 10],
      formatter: '{b}:{c}篇文章({d}%)',
    },
  }

  chart.setOption(option, true)
}

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  updateChart()
  window.addEventListener('resize', resize)
})

watch(
  () => blogStore.articles,
  () => {
    updateChart()
  },
  { deep: true },
)

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <div class="tag-chart-container">
    <div ref="chartRef"></div>
  </div>
</template>

<style scoped>
.tag-chart-container {
  width: 100%;
  max-width: 500px;
  /* 不要设 min-width：窄屏上容器本来就不到 300px，
     最小值会把图表顶出卡片造成横向溢出 */
  margin: 0 auto;
}

.tag-chart-container > div {
  width: 100%;
  height: 300px;
}

/* 大屏幕适配 */
@media (min-width: 1024px) {
  .tag-chart-container > div {
    max-height: 350px;
  }
}

@media (max-width: 768px) {
  .tag-chart-container > div {
    width: 100%;
    /* 移动端更小 */
  }
}
</style>
