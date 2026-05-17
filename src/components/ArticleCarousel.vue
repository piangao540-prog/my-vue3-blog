<!-- 文章轮播图组件 -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBlogStore } from '@/stores/blog'
import { useRouter } from 'vue-router'

const router = useRouter()

const blogStore = useBlogStore()
// 轮播图当前文章索引
const currentIndex = ref(0)
// 轮播图文章列表
const carouselArticles = computed(() => {
    return blogStore.articles.slice(0, 4)
})
let timer: number
// 当前显示的文章
const currentArticle = computed(() => {
    return carouselArticles.value[currentIndex.value]
})
// 下一篇
const nextArticles = () => {
    if (carouselArticles.value.length > 0) {
        currentIndex.value = (currentIndex.value + 1) % carouselArticles.value.length
    }
}
// 上一篇
// const prevArticles = () => {
//     return currentIndex.value = (currentIndex.value - 1 + carouselArticles.value.length) % carouselArticles.value.length
// }
const goToSlide = (index: number) => {
    currentIndex.value = index
}
// 跳转详情页
const goToDetail = () => {
    if (currentArticle.value) {
        router.push(`/articles/${currentArticle.value.id}`)
    }
}

onMounted(() => {
    timer = setInterval(() => {
        nextArticles()
    }, 3000)
})
onUnmounted(() => {
    clearInterval(timer)
})
</script>
<template>
    <div class="carousel">
        <transition name="fade" mode="out-in">
            <div v-if="currentArticle" class="carousel-item" :key="currentArticle.id" @click="goToDetail">
                <h4 class="carousel-title">{{ currentArticle.title }}</h4>
                <p class="carousel-summary">{{ currentArticle.summary }}</p>
            </div>
            <div v-else class="carousel-loading">加载中...</div>
        </transition>
        <div class="carousel-indicators">
            <button v-for="(_, index) in carouselArticles" :key="index" :class="{ active: index === currentIndex }"
                @click.stop="goToSlide(index)"></button>
        </div>
    </div>
</template>
<style scoped>
.carousel {
    margin-top: 16px;
    min-height: 80px;
    /* 固定最小高度，防止跳动 */
}

.carousel-item {
    text-align: center;
    min-height: 60px;
    /* 固定内容区域高度 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;
}

.carousel-title {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 8px;
    opacity: 0.98;
}

.carousel-summary {
    font-size: 0.85rem;
    opacity: 0.85;
    line-height: 1.5;
    max-width: 350px;
    margin: 0 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.carousel-indicators {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;
}

.carousel-indicators button {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: background 0.3s;
}

.carousel-indicators button.active {
    background: rgba(255, 255, 255, 0.9);
}


.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>