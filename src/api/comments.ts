
import axios from './axios'

export interface Comment {
    id: number,
    article_id: number,
    content: string,
    author: string,
    authorAvatar?: string,
    createdAt: string
}

// 获取文章评论
export const getComments = async (articleId: number): Promise<Comment[]> => {
    const response = await axios.get(`/comments/${articleId}`)
    return response.data.map((c: any) => ({
        id: c.id,
        article_id: c.article_id,
        content: c.content,
        author: c.author,
        authorAvatar: c.author_avatar,
        createdAt: c.createdAt
    }))
}

// 添加评论
export const addComment = async (articleId: number, content: string, author: string, authorAvatar: string): Promise<Comment[]> => {
    const response = await axios.post(`/comments/${articleId}`, { content, author, authorAvatar })
    return response.data
}

// 删除评论
export const deleteComment = async (id: number) => {
    await axios.delete(`/comments/${id}`)
}

// 获取用户自己的评论
export const getUserComments = async (author: string): Promise<Comment[]> => {
    const response = await axios.get('/comments/user', { params: { author } })
    return response.data.map((c: any) => ({
        id: c.id,
        article_id: c.article_id,
        content: c.content,
        author: c.author,
        authorAvatar: c.author_avatar,
        createdAt: c.createdAt
    }))
}