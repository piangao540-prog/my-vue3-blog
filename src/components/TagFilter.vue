<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useSearchStore } from '@/stores/search'
import { useSearchFilter } from '@/composables/useSearchFilter'


const searchStore = useSearchStore()
const {allTags} = useSearchFilter()

</script>

<template>
  <div class="tag-filter">
    <el-button :type="searchStore.selectedTag === '' ? 'primary' : 'default'" @click="searchStore.setSelectedTag('')">
      全部
    </el-button>
    <el-button v-for="tag in allTags" :key="tag" :type="searchStore.selectedTag === tag ? 'primary' : 'default'"
      @click="searchStore.setSelectedTag(tag)">
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