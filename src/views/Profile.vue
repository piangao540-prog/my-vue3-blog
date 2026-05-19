<template>
  <div class="profile">
    <!-- 用户卡片信息 -->
    <div class="user-card">
      <el-avatar :size="80" :src="userAvatar" />
      <div>
        <h2>{{ userInfo?.username }}</h2>
        <p>{{ userInfo?.nickname || '未设置昵称' }}</p>
      </div>
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
          <li v-for="article in likedArticles" :key="article.id" class="article-item">
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
    nickname: userInfo.value?.nickname || '',
    bio: userInfo.value?.bio || ''
  }
}

// 保存信息
const saveBasicInfo = () => {
  userStore.updateUserInfo(basicForm.value)
  alert('保存成功')
}
const changePassword = () => {
  userStore.changePassword(
    passwordForm.value.oldPassword,
    passwordForm.value.newPassword
  )
  alert('修改成功')
}

onMounted(() => {
  initForm()
})
</script>