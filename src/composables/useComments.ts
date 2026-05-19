import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import userAvatar from '@/assets/images/converted_image.png'

export interface Comment {
    id: number
    content: string
    author: string
    createdAt: string
    authorAvatar: string
}

// 格式化时间为标准格式 YYYY-MM-DD HH:MM
const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
}

export const useComments = () => {
    const userStore = useUserStore()
    const saved = localStorage.getItem('comments')
    const comments = ref<Comment[]>(saved ? JSON.parse(saved) : [])

    // 保存评论到本地
    const saveComment = () => {
        localStorage.setItem('comments', JSON.stringify(comments.value))
    }

    // 添加评论
    const addComment = (content: string) => {
        if (!content.trim()) {
            alert('请输入评论内容')
            return
        }
        const comment: Comment = {
            id: Date.now(),
            content,
            author: userStore.userInfo?.nickname || '匿名用户',
            createdAt: new Date().toISOString(),
            authorAvatar: userStore.userInfo?.avatar || userAvatar,
        }
        comments.value.unshift(comment)
        saveComment()
    }

    // 删除评论
    const deleteComment = (id: number) => {
        comments.value = comments.value.filter((item) => item.id !== id)
        saveComment()
    }

    const commentCount = computed(() => comments.value.length)

    return {
        comments,
        addComment,
        deleteComment,
        commentCount,
        formatTime
    }
}
