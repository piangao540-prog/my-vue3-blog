<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu as MenuIcon } from '@element-plus/icons-vue'
import portrait from '@/assets/images/portrait.png'

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
  <el-container class="blog-layout">
    <el-header class="blog-header">
      <el-avatar :size="40" :src="portrait"></el-avatar>
      <div class="logo">PianGao</div>

      <el-button class="menu-button" @click="drawer = true">
        <el-icon>
          <MenuIcon />
        </el-icon>
      </el-button>

      <el-drawer v-model="drawer" direction="ltr" size="240px" title="菜单">
        <el-menu
          mode="vertical"
          router
          :default-active="activeMenu"
          @select="drawer = false"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/articles">文章</el-menu-item>
          <el-menu-item index="/about">关于</el-menu-item>
        </el-menu>
      </el-drawer>
    </el-header>

    <el-main class="blog-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.blog-layout {
  min-height: 100vh;
}

.blog-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}



.logo {
  font-size: 20px;
  font-weight: 700;
  margin-left: 10px;
}

.menu-button {
  border-radius: 10px;
}

.blog-main {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0;
}

.el-button{
  margin-left: 20px;
}
</style>
