<script setup lang="ts">
defineEmits<{ retry: [] }>()
</script>

<template>
  <el-empty description="加载失败，可能是网络不通">
    <el-button type="primary" @click="$emit('retry')">重新加载</el-button>
  </el-empty>
</template>
