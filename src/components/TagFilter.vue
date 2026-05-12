<script setup lang="ts">
// import { userTagFilter } from '@/composables/useTagFilter'
import { ElButton } from 'element-plus'
// const {selectedTag, allTags} = userTagFilter()

// 接受父组件传来的数据
defineProps<{
  selectedTag:string
  allTags:string[]
}>()
// 声明可以触发的事件
const emit = defineEmits<{(e:'update:selectedTag',value:string):void}>()
const setTag = (tag: string) => {emit('update:selectedTag', tag) }
</script>

<template>
  <div class="tag-filter">
    <el-button :type="selectedTag === '' ? 'primary' : 'default'" @click="setTag('')">
      全部
    </el-button>
    <el-button v-for="tag in allTags" :key="tag" :type="selectedTag === tag ? 'primary' : 'default'"
      @click="setTag(tag)">
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