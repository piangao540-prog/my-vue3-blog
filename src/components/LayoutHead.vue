<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu as MenuIcon ,Search} from '@element-plus/icons-vue'
import portrait from '@/assets/images/portrait.png'
import { useSearchStore } from '@/stores/search'



const searchStore = useSearchStore()
const drawer = ref(false)
const route = useRoute()





const activeMenu = computed(() => {
  if (route.path.startsWith('/articles')) {
    return '/articles'
  }

  return route.path
})
</script>

<template>
  <header class="blog-header">
    <!-- 左侧：头像和logo -->
    <div class="header-left">
      <el-avatar :size="40" :src="portrait"></el-avatar>
      <div class="logo">PianGao</div>
      <el-button class="menu-button" @click="drawer = true">
        <el-icon>
          <MenuIcon />
        </el-icon>
      </el-button>
    </div>

    <!-- 右侧：搜索框 -->
    <div class="header-right">
      <div class="search-box">
        <el-input
          v-model="searchStore.searchKeyword"
          placeholder="搜索文章..."
          :prefix-icon="Search"
          clearable
          class="search-input"
        />
      </div>
    </div>

    <el-drawer v-model="drawer" direction="ltr" size="240px" title="菜单">
      <el-menu mode="vertical" router :default-active="activeMenu" @select="drawer = false">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/articles">文章</el-menu-item>
        <el-menu-item index="/about">关于</el-menu-item>
      </el-menu>
    </el-drawer>
  </header>
</template>

<style scoped>
.blog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;  /* 左右分布 */
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  margin-left: 12px;
  color: #370c61;
  letter-spacing: 1px;
}

.menu-button {
  border-radius: 8px;
  margin-left: 16px;
  padding: 6px 12px;
}

.el-button {
  margin-left: 10px;
}

/* 搜索框容器 */
.header-right {
  display: flex;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-input {
  width: 280px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #ffffff;
}

.search-input:hover {
  border-color: #d1d5db;
}

.search-input:focus {
  border-color: #e86f83;
  box-shadow: 0 0 0 2px rgba(232, 111, 131, 0.2);
  outline: none;
}

/* 搜索图标颜色 */
.search-input :deep(.el-input__icon) {
  color: #9ca3af;
}

.search-input:focus :deep(.el-input__icon) {
  color: #e86f83;
}
</style>