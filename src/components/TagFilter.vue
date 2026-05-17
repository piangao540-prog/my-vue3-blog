<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useSearchStore } from '@/stores/search'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { getTagColor } from '@/composables/useTagColor'

const searchStore = useSearchStore()
const { allTags } = useSearchFilter()

const getTagStyle = (tag: string) => {
  const isSelected = searchStore.selectedTag === tag
  return {
    color: isSelected ? '#409eff' : getTagColor(tag),
    backgroundColor: isSelected ? '#ecf5ff' : '',
    borderColor: isSelected ? '#409eff' : '',
    boxShadow: isSelected ? '0 2px 8px rgba(64, 158, 255, 0.2)' : ''
  }
}
</script>

<template>
  <div class="tag-filter">
    <el-button :type="searchStore.selectedTag === '' ? 'primary' : 'default'" @click="searchStore.setSelectedTag('')">
      全部
    </el-button>
    <el-button v-for="tag in allTags" :key="tag" @click="searchStore.setSelectedTag(tag)" :style="getTagStyle(tag)">
      {{ tag }}
    </el-button>
  </div>
</template>

<style scoped>
.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
</style>
