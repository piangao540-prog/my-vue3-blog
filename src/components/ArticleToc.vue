<script lang="ts">
export interface TocItem {
  id: string
  text: string
  level: number
}
</script>

<script setup lang="ts">
defineProps<{
  items: TocItem[]
  activeId: string
}>()

const emit = defineEmits<{ select: [id: string] }>()
</script>

<template>
  <nav v-if="items.length > 1" class="article-toc">
    <p class="toc-title">目录</p>
    <ul class="toc-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="toc-item"
        :class="[`level-${item.level}`, { active: item.id === activeId }]"
      >
        <a :href="`#${item.id}`" @click.prevent="emit('select', item.id)">{{ item.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/*
 * 浮动目录：用 fixed 定位挂在正文右侧，不去改动 .article-detail 的居中布局。
 * 正文宽 800px、居中，右边缘在视口 50% + 420px 处；这里留 32px 间距、目录宽 170px，
 * 因此目录右边缘落在 50% + 622px，视口至少要 1244px 才放得下，窄屏直接隐藏。
 */
.article-toc {
  position: fixed;
  top: 110px;
  right: calc(50% - 622px);
  width: 170px;
  max-height: calc(100vh - 170px);
  overflow-y: auto;
  font-size: 0.85rem;
}

.toc-title {
  margin: 0 0 12px;
  font-weight: 600;
  color: #303133;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 2px solid #ebeef5;
}

.toc-item a {
  display: block;
  padding: 4px 0 4px 12px;
  margin-left: -2px;
  color: #909399;
  text-decoration: none;
  border-left: 2px solid transparent;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.toc-item a:hover {
  color: #e86f83;
}

.toc-item.active a {
  color: #e86f83;
  border-left-color: #e86f83;
  font-weight: 600;
}

.toc-item.level-3 a {
  padding-left: 24px;
  font-size: 0.8rem;
}

@media (max-width: 1243px) {
  .article-toc {
    display: none;
  }
}
</style>
