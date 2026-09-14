<script lang="ts">
export interface TocItem {
  id: string
  text: string
  level: number
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { List } from '@element-plus/icons-vue'

defineProps<{
  items: TocItem[]
  activeId: string
}>()

const emit = defineEmits<{ select: [id: string] }>()

// 窄屏下目录折叠成左下角的悬浮按钮，点开是从底部推上来的面板
const open = ref(false)

const select = (id: string) => {
  open.value = false
  emit('select', id)
}
</script>

<template>
  <template v-if="items.length > 1">
    <button
      class="toc-toggle"
      type="button"
      :aria-expanded="open"
      aria-label="文章目录"
      @click="open = !open"
    >
      <el-icon><List /></el-icon>
      <span>{{ open ? '收起' : '目录' }}</span>
    </button>

    <nav class="article-toc" :class="{ 'is-open': open }">
      <p class="toc-title">目录</p>
      <ul class="toc-list">
        <li
          v-for="item in items"
          :key="item.id"
          class="toc-item"
          :class="[`level-${item.level}`, { active: item.id === activeId }]"
        >
          <a :href="`#${item.id}`" @click.prevent="select(item.id)">{{ item.text }}</a>
        </li>
      </ul>
    </nav>
  </template>
</template>

<style scoped>
/*
 * 浮动目录：用 fixed 定位挂在正文右侧，不去改动 .article-detail 的居中布局。
 * 正文宽 800px、居中，右边缘在视口 50% + 420px 处；这里留 32px 间距、目录宽 170px，
 * 因此目录右边缘落在 50% + 622px，视口至少要 1244px 才放得下，更窄时换成底部面板。
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

/* 悬浮按钮只在窄屏出现 */
.toc-toggle {
  display: none;
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
  .toc-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    position: fixed;
    left: 20px;
    bottom: 20px;
    /* 比面板高一层：面板弹出来时它还在最上面，点它就能收起 */
    z-index: 1001;
    padding: 8px 14px;
    font-size: 0.85rem;
    color: #606266;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  .article-toc {
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    width: auto;
    max-height: 55vh;
    /* 底部留白，避免最后一条被悬浮按钮挡住 */
    padding: 20px 20px 72px;
    background: #fff;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(100%);
    /* 收起时一并藏起可见性，否则面板虽然移出屏幕，里面的链接仍能被 Tab 聚焦 */
    visibility: hidden;
    transition:
      transform 0.25s ease,
      visibility 0.25s;
    z-index: 1000;
  }

  .article-toc.is-open {
    transform: translateY(0);
    visibility: visible;
  }
}
</style>
