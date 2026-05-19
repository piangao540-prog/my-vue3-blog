<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useComments } from '@/composables/useComments'

const userStore = useUserStore()
const { comments, addComment, deleteComment, commentCount,formatTime } = useComments()

const newComment = ref('')
const handleSubmit = () => {
    addComment(newComment.value)
    newComment.value = ''
}
</script>

<template>
    <div class="comment-section">
        <h3>评论区 ({{ commentCount }})</h3>

        <!-- 发表评论表单 -->
        <div class="comment-form">
            <textarea v-model="newComment" placeholder="留下你想说的话..." rows="3"></textarea>
            <div class="form-actions">
                <span class="author-info">发表者：{{ userStore.userInfo?.nickname || '匿名用户' }}</span>
                <el-button type="primary" @click="handleSubmit">发表评论</el-button>
            </div>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">{{ comment.author || '匿名用户' }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
                <button class="delete-btn" @click="deleteComment(comment.id)">删除</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.comment-section {
    margin-top: 30px;
}

.comment-form {
    margin-bottom: 24px;
}

.comment-form textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    resize: vertical;
}

.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
}

.author-info {
    color: #666;
    font-size: 0.9rem;
}

.comment-list {
    border-top: 1px solid #eee;
    padding-top: 16px;
}

.comment-item {
    padding: 16px;
    border-bottom: 1px solid #eee;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.comment-author {
    font-weight: 600;
    color: #333;
}

.comment-time {
    color: #999;
    font-size: 0.8rem;
}

.comment-content {
    color: #555;
    line-height: 1.6;
}

.delete-btn {
    margin-top: 8px;
    padding: 4px 12px;
    font-size: 0.8rem;
    color: #999;
    border: none;
    background: transparent;
    cursor: pointer;
}

.delete-btn:hover {
    color: #ff4444;
}
</style>