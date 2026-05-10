<script setup lang="ts">
import LayoutHead from './LayoutHead.vue'
import LayoutFooter from './LayoutFooter.vue'
import BackToTop from './BackToTop.vue'
</script>

<template>
  <div class="blog-layout">
    <LayoutHead />

    <main class="blog-main">
      <router-view />
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
}
</style>