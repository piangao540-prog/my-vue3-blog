<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu as MenuIcon, Search } from '@element-plus/icons-vue'
import portrait from '@/assets/images/portrait.png'
import { useSearchStore } from '@/stores/search'
import { ElMenu, ElMenuItem } from 'element-plus'
import { debounce } from '@/utils/debounce'
import router from '@/router'
import { useUserStore } from '@/stores/user'



const searchStore = useSearchStore()
const userStore = useUserStore()
const drawer = ref(false)
const route = useRoute()

// 搜索框防抖
const localKeyword = ref('')
const debounceSearch = debounce((value: string) => {
  searchStore.setSearchKeyword(value)
}, 500)

// 退出登录
const handleLogout = () => {
  userStore.loginOut()
  router.push('/login')
}



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
      <el-drawer v-model="drawer" direction="ltr" size="240px" title="菜单">
        <el-menu mode="vertical" router :default-active="activeMenu" @select="drawer = false">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/articles">文章</el-menu-item>
          <el-menu-item index="/archive">归档</el-menu-item>
          <el-menu-item index="/about">关于</el-menu-item>
        </el-menu>
      </el-drawer>
    </div>
    <div class="header-middle">
      <el-menu mode="horizontal" router :default-active="activeMenu" class="nav-menu">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/articles">文章</el-menu-item>
        <el-menu-item index="/archive">归档</el-menu-item>
        <el-menu-item index="/about">关于</el-menu-item>
      </el-menu>
    </div>
    <!-- 右侧：搜索框 ,登录按钮 -->
    <div class="header-right">
      <div class="search-box">
        <el-input v-model="localKeyword" @input="debounceSearch" placeholder="搜索文章..." :prefix-icon="Search" clearable
          class="search-input" />
      </div>
      <div v-if="userStore.isLoggedIn">
        <el-dropdown>
          <el-button>{{ userStore.userInfo?.username }}</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="router.push('/profile')">个人中心</el-dropdown-item>
              <el-dropdown-item @click="handleLogout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div v-else>
        <el-button class="login-button" @click="router.push('/login')">登录</el-button>
      </div>
    </div>


  </header>
</template>

<style scoped>
.blog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 左右分布 */
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .05);
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

.header-middle {
  flex: 1;
  /* 占据中间空间 */
  display: flex;
  justify-content: center;
}

.nav-menu {
  border: none;
  /* 去掉默认边框 */
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
  width: 136px;
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

.login-button {
  background: #7b99d6;
  color: #fff;
}
</style>