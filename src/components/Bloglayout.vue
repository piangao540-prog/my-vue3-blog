<script setup lang="ts">
import LayoutHead from './LayoutHead.vue'
import LayoutFooter from './LayoutFooter.vue'
import BackToTop from './BackToTop.vue'
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';
</script>

<template>
  <div class="blog-layout">
    <LayoutHead />

    <main class="blog-main">
      <router-view v-slot="{Component}">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <BackToTop />

    <LayoutFooter />
  </div>
</template>

<style scoped>
.blog-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.blog-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 160px);
  position: relative;
}

.blog-main > div{
  position:relative;
}
</style>