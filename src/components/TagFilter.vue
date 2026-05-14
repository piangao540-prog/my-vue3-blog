<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useSearchStore } from '@/stores/search'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { getTagColor } from '@/composables/useTagColor'



const searchStore = useSearchStore()
const { allTags } = useSearchFilter()

</script>

<template>
  <div class="tag-filter">
    <el-button :type="searchStore.selectedTag === '' ? 'primary' : 'default'" @click="searchStore.setSelectedTag('')">
      全部
    </el-button>
    <el-button v-for="tag in allTags" :key="tag" @click="searchStore.setSelectedTag(tag)"
      :style="{ color: getTagColor(tag) }">
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
  /* background-color:rgba(74, 21, 174, 0.422); */
}
</style>