<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useComments } from '@/composables/useComments'

const userStore = useUserStore()
const { comments, addComment, deleteComment, commentCount, formatTime } = useComments()


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
                    <el-avatar :size="32" :src="comment.authorAvatar" />
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

.comment-section h3 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #409eff;
    display: inline-block;
}

.comment-form {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
}

.comment-form textarea {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    resize: vertical;
    font-size: 14px;
    line-height: 1.6;
    transition: border-color 0.2s ease;
    min-height: 100px;
}

.comment-form textarea:focus {
    outline: none;
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
}

.author-info {
    color: #666;
    font-size: 13px;
}

.comment-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.comment-item {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

.comment-item:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.comment-author {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.comment-time {
    color: #999;
    font-size: 12px;
    margin-left: auto;
}

.comment-content {
    color: #555;
    line-height: 1.7;
    font-size: 14px;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 12px;
}

.delete-btn {
    padding: 6px 14px;
    font-size: 12px;
    color: #ff6b6b;
    background: #fff5f5;
    border: 1px solid #ffe0e0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.delete-btn:hover {
    color: #ff4444;
    background: #ffeaea;
    border-color: #ffcccc;
}
</style>