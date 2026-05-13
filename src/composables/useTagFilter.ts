import { computed } from 'vue'
import { useBlogStore } from '@/stores/blog'

export const userTagFilter = (selectedTag: { value: string }) => {
    const blogStore = useBlogStore()
    // 筛选标签属性
    const filterArticles = computed(() => {
        if (selectedTag.value) {
            return blogStore.getArticlesByTag(selectedTag.value)
        } else {
            return blogStore.latestArticles
        }
    })

    // 所有标签列表
    const allTags = computed(() => {
        const tags = new Set<string>()
        blogStore.articles.forEach(articles => {
            articles.tags.forEach(tag => tags.add(tag))
        })
        // 转发为数组
        return Array.from(tags)
    })
    // 切换标签
    const setTag = (tag: string) => {
        selectedTag.value = tag
    }

    // 切换标签时滚动到顶部
    // watch(selectedTag, () => {
    //     window.scrollTo({ top: 0, behavior: 'smooth' })
    // })

    return {
        selectedTag,
        setTag,
        filterArticles,
        allTags,
    }
}
