<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useBlogStore } from '@/stores/blog'
// 引入echarts
import * as echarts from 'echarts'
let chart: echarts.ECharts | null = null

// 容器宽度变了要重新决定"标签显不显示"，所以 resize 不只是重绘尺寸
const resize = () => {
  chart?.resize()
  updateChart()
}
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

  // 画布宽度不够时，饼图外圈的标签会被裁掉。
  // 窄屏（手机、平板下的侧栏）关掉标签、放大饼图，靠底部图例辨识；
  // 宽屏留得下标签，就照常显示，不用去对颜色。
  const isNarrow = chartRef.value.clientWidth < 400

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
        radius: isNarrow ? ['18%', '62%'] : ['13%', '45%'],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: !isNarrow, fontSize: 11 },
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
