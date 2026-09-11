<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <p class="code">404</p>
    <h1>这个页面走丢了</h1>
    <p class="tip">链接可能已经失效，或者地址输错了。</p>
    <div class="actions">
      <el-button type="primary" @click="router.push('/')">返回首页</el-button>
      <el-button @click="router.push('/articles')">浏览文章</el-button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 80px 20px;
}

.code {
  font-size: 96px;
  font-weight: 700;
  color: #e86f83;
  line-height: 1;
  margin-bottom: 16px;
}

.not-found h1 {
  font-size: 24px;
  margin-bottom: 12px;
}

.tip {
  color: #909399;
  margin-bottom: 28px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>