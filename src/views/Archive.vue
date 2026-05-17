<script setup lang="ts">
import { computed } from 'vue'
import { useBlogStore } from '@/stores/blog'
import { useRouter } from 'vue-router'
import type { Article } from '@/stores/blog'

const router = useRouter()
const blogStore = useBlogStore()
interface YearGroups {
    [year: string]: {
        [month: string]: Article[]
    }
}
// 按年份和月份分组文章
const groupedArticles = computed<YearGroups>(() => {
    const group: YearGroups = {}

    blogStore.articles.forEach(article => {
        const date = new Date(article.createdAt)
        const year = date.getFullYear().toString()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        if (!group[year]) {
            group[year] = {}
        }
        if (!group[year][month]) {
            group[year][month] = []
        }
        group[year][month].push(article)
    })
    return group
})
// 获取年份（按时间倒序）
const years = computed(() => {
    return Object.keys(groupedArticles.value).sort((a, b) => Number(b) - Number(a))
})
// 月份名称映射
const monthNames: Record<string, string> = {
    '01': '一月', '02': '二月', '03': '三月', '04': '四月',
    '05': '五月', '06': '六月', '07': '七月', '08': '八月',
    '09': '九月', '10': '十月', '11': '十一月', '12': '十二月'
}
const goToArticles = (id: number) => {
    router.push(`/articles/${id}`)
}
</script>

<template>
    <div class="archive">
        <h1 class="active-title">文章归档</h1>
        <div v-for="year in years" :key="year" class="year-group">
            <h2 class="year">{{ year }}</h2>
            <div v-for="(articles, month) in groupedArticles[year]" :key="month" class="month-group">
                <h3 class="month">{{ monthNames[month] }}</h3>
                <ul class="article-list">
                    <li v-for="article in articles" :key="article.id" @click="goToArticles(article.id)">
                        <span class="article-title">{{ article.title }}</span>
                        <span class="article-date">{{ article.createdAt.slice(5, 10) }}</span>
                    </li>
                </ul>

            </div>
        </div>
    </div>
</template>

<style scoped>
.archive {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.archive-title {
    text-align: center;
    margin-bottom: 40px;
    color: #333;
}

.year-group {
    margin-bottom: 30px;
}

.year {
    font-size: 1.5rem;
    color: #667eea;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #667eea;
}

.month-group {
    margin-left: 20px;
    margin-bottom: 20px;
}

.month {
    font-size: 1.1rem;
    color: #555;
    margin-bottom: 10px;
}

.article-list {
    list-style: none;
    padding: 0;
}

.article-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
}

.article-list li:hover {
    background: #e9ecef;
}

.article-title {
    flex: 1;
    color: #333;
}

.article-date {
    color: #999;
    font-size: 0.9rem;
    margin-left: 20px;
}
</style>