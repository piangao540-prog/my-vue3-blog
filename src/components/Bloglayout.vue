<script setup lang="ts"></script>

<template>
    <el-container class="blog-layout">
        <el-header  class="blog-header">
            <div class="logo">My Blog</div>
            <el-menu mode="horizontal" router :default-active="$route.path">
                <el-menu-item index="/">首页</el-menu-item>
                <el-menu-item index="/articles">文章</el-menu-item>
                <el-menu-item index="/about">关于</el-menu-item>
            </el-menu>
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
  margin-right: 40px;
  font-size: 20px;
  font-weight: 700;
}

.blog-main {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
}
</style>