import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import userAvatar from '@/assets/images/converted_image.png'
import * as commentApi from '@/api/comments'

export interface Comment {
    id: number
    content: string
    author: string
    createdAt: string
    authorAvatar: string
}

// 格式化时间为标准格式 YYYY-MM-DD HH:MM
export const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
}

export const useComments = (articleId?: number) => {
    const userStore = useUserStore()
    const comments = ref<commentApi.Comment[]>([])

    // 加载评论
    const loadComments = async () => {
        if (articleId) {
            comments.value = await commentApi.getComments(articleId)
        } else {
            const user = userStore.userInfo
            if (!user) return
            comments.value = await commentApi.getUserComments(user.nickname || user.username)
        }
    }

    // 添加评论
    const addComment = async (content: string) => {
        if (!content.trim()) {
            alert('请输入评论内容')
            return
        }
        const id = articleId
        if (!id) return
        const author = userStore.userInfo?.nickname || userStore.userInfo?.username || '匿名用户'
        const authorAvatar = userStore.userInfo?.avatar || userAvatar
        await commentApi.addComment(id, content, author, authorAvatar)
        await loadComments()
    }

    // 删除评论
    const deleteComment = async (id: number) => {
        await commentApi.deleteComment(id)
        await loadComments()
    }

    const commentCount = computed(() => comments.value.length)

    // 初始化加载
    onMounted(() => {
        loadComments()
    })

    return {
        comments,
        addComment,
        deleteComment,
        commentCount,
        formatTime
    }
}
