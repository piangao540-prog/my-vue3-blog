<script setup lang="ts">
import { ref ,onMounted,onUnmounted} from 'vue'
import { Top } from '@element-plus/icons-vue'

const showBackToTop = ref(false)
const handleScroll = () =>{
    showBackToTop.value = window.scrollY > 300
}
const scrollToTop = () =>{
    window.scrollTo({top:0,behavior:'smooth'})
}
onMounted(() =>{
    window.addEventListener('scroll',handleScroll)
})
onUnmounted(() =>{
    window.removeEventListener('scroll',handleScroll)
})
</script>

<template>
    <transition name="fade">
        <el-button v-if="showBackToTop" class="back-to-top"  circle @click="scrollToTop">
                    <el-icon><Top /></el-icon>
        </el-button>
    </transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 40px;
  bottom: 160px;
  z-index: 999;
  width: 50px !important;
  height: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ff6b9d, #ff8fab);
  border:none;
  color:white
}

.back-to-top:hover {
  background: linear-gradient(135deg, #ff5a8a, #ff7da3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>