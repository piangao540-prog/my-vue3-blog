<template>
  <div class="profile">
    <!-- 用户卡片信息 -->
    <div class="user-card">
      <el-avatar :size="80" :src="userAvatar" />
      <div>
        <h2>{{ userInfo?.username }}</h2>
        <p>{{ userInfo?.nickname || '未设置昵称' }}</p>
      </div>
      <div class="bio">{{ userInfo?.bio || '未设置简介' }}</div>
    </div>
    <!-- 标签页 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="basic">
        <el-form :model="basicForm">
          <el-form-item label="昵称">
            <el-input v-model="basicForm.nickname" />
          </el-form-item>
          <el-form-item label="简介">
            <el-input v-model="basicForm.bio" type="textarea" />
          </el-form-item>
          <el-button type="primary" @click="saveBasicInfo">保存</el-button>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="安全设置" name="security">
        <el-form :model="passwordForm">
          <el-form-item label="原密码">
            <el-input v-model="passwordForm.oldPassword" type="password" />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="passwordForm.newPassword" type="password" />
          </el-form-item>
          <el-button type="primary" @click="changePassword">修改密码</el-button>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="我的收藏" name="likes">
        <div v-if="likedArticles.length === 0" class="empty-tip">暂无收藏</div>
        <ul v-else class="article-list">
          <li v-for="article in likedArticles" :key="article.id" class="article-item" @click="goToArticle(article)">
            {{ article.title }}
          </li>
        </ul>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useBlogStore } from '@/stores/blog'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const userStore = useUserStore()
const blogStore = useBlogStore()
// 默认头像
import userAvatar from '@/assets/images/converted_image.png'

// 状态
const activeTab = ref('basic')
const basicForm = ref({ nickname: '', bio: '' })
const passwordForm = ref({ oldPassword: '', newPassword: '' })

// 计算属性
const userInfo = computed(() => userStore.userInfo)
const likedArticles = computed(() => {
  return blogStore.articles.filter(a => a.like)
})

// 方法
// 获取用户头像和简介
const initForm = () => {
  basicForm.value = {
    nickname: '',
    bio: ''
  }
}

// 点击跳转文章
const goToArticle = (article) => {
  router.push({ name: 'article-detail', params: { id: article.id } })
}

// 保存信息
const saveBasicInfo = () => {
  userStore.updateUserInfo(basicForm.value)
  alert('保存成功')
  basicForm.value = { nickname: '', bio: '' }
}
const changePassword = () => {
  userStore.changePassword(
    passwordForm.value.oldPassword,
    passwordForm.value.newPassword
  )
  alert('修改成功')
  passwordForm.value = { oldPassword: '', newPassword: '' }
}

onMounted(() => {
  initForm()
})
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.user-card h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.user-card p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.user-card .bio {
  margin-left: 43px;
  margin-top: 12px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  max-width: 600px;
  min-width: 388px;
  padding: 12px 16px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  min-height: 60px;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  background: #fafafa;
  border-radius: 8px;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-item {
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}

.article-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.el-tabs__content {
  padding: 20px 0;
}

.el-form {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.el-form-item {
  margin-bottom: 20px;
}
</style>