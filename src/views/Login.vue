<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')

const handleLogin = () => {
  if (!username.value || !password.value) {
    alert('请填写完整')
    return
  }

  const success = userStore.login(username.value, password.value)

  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="login-wrapper">
    <!-- 左边：图片区域 -->
    <div class="login-left">
      <div class="image-container">
        <img src="@/assets/images/portrait.png" alt="头像" />
      </div>
      <div class="left-content">
        <h3>个人博客</h3>
        <p>记录技术成长，分享学习心得</p>
      </div>
    </div>

    <!-- 右边：表单区域 -->
    <div class="login-right">
      <div class="form-container">
        <div class="logo">
          <span class="logo-text">My Blog</span>
        </div>

        <h2 class="welcome-title">欢迎回来</h2>

        <el-form label-width="0" class="login-form">
          <el-form-item>
            <el-input v-model="username" placeholder="用户名" class="input-field" prefix-icon="User" />
          </el-form-item>

          <el-form-item>
            <el-input v-model="password" type="password" placeholder="密码" class="input-field" prefix-icon="Lock" />
          </el-form-item>

          <el-form-item class="forgot-link">
            <a href="#">忘记密码？</a>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleLogin" class="login-btn">
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  min-height: 70vh;
  min-width: 60vw;
  /* border: 0.6px solid #575757a7; */
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* 左边区域 */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #3befab 0%, #318f6f 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 40px;
}

.image-container {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.left-content {
  text-align: center;
}

.left-content h3 {
  font-size: 1.8rem;
  margin-bottom: 12px;
  font-weight: 600;
}

.left-content p {
  font-size: 1rem;
  opacity: 0.9;
  max-width: 300px;
}

/* 右边区域 */
.login-right {
  flex: 1;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.welcome-title {
  text-align: center;
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 30px;
}

.login-form {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  height: 44px;
  border-radius: 8px;
}

.forgot-link {
  text-align: right;
  margin-bottom: 16px;
}

.forgot-link a {
  color: #667eea;
  font-size: 0.9rem;
}

.login-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.login-btn:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}



.register-link {
  text-align: center;
  margin-top: 30px;
  font-size: 0.9rem;
  color: #666;
}

.register-link a {
  color: #667eea;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
  }

  .login-left {
    min-height: 40vh;
  }
}
</style>
