<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMenu, ElMenuItem, ElContainer, ElHeader, ElMain } from 'element-plus'

const router = useRouter()

const menuItems = [
  { path: '/', name: '首页' },
  { path: '/articles', name: '文章' },
  { path: '/about', name: '关于' },
]

const handleMenuClick = (path: string) => {
  router.push(path)
}
</script>

<template>
  <ElContainer class="app-container">
    <ElHeader class="app-header">
      <div class="logo">我的博客</div>
      <ElMenu mode="horizontal" class="nav-menu">
        <ElMenuItem
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
          @click="handleMenuClick(item.path)"
          :class="{ active: router.currentRoute.value.path === item.path }"
        >
          {{ item.name }}
        </ElMenuItem>
      </ElMenu>
    </ElHeader>
    <ElMain class="app-main">
      <router-view />
    </ElMain>
  </ElContainer>
</template>

<style scoped>
.app-container {
  height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  flex: 1;
  justify-content: flex-end;
}

.nav-menu :deep(.el-menu-item) {
  color: white;
}

.nav-menu :deep(.el-menu-item.active) {
  background-color: rgba(255, 255, 255, 0.2);
}

.app-main {
  background: #f5f5f5;
  overflow-y: auto;
}
</style>
