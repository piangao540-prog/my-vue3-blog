<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleRegister = async () => {
  if (!username.value || !password.value || !confirmPassword.value) {
    alert('请填写完整')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('两次密码不一致')
    return
  }

  const success = await userStore.register(username.value, password.value)

  if (success) {
    alert('注册成功！请登录')
    router.push('/login')
  }
}
</script>

<template>
  <div class="register-wrapper">
    <!-- 左边：图片区域 -->
    <div class="register-left">
      <div class="image-container">
        <img src="@/assets/images/portrait.png" alt="头像" />
      </div>
      <div class="left-content">
        <h3>个人博客</h3>
        <p>记录技术成长，分享学习心得</p>
      </div>
    </div>

    <!-- 右边：表单区域 -->
    <div class="register-right">
      <div class="form-container">
        <div class="logo">
          <span class="logo-text">My Blog</span>
        </div>

        <h2 class="welcome-title">创建账号</h2>

        <el-form label-width="0" class="register-form">
          <el-form-item>
            <el-input v-model="username" placeholder="用户名" class="input-field" prefix-icon="User" />
          </el-form-item>

          <el-form-item>
            <el-input v-model="password" type="password" placeholder="密码" class="input-field" prefix-icon="Lock" />
          </el-form-item>

          <el-form-item>
            <el-input v-model="confirmPassword" type="password" placeholder="确认密码" class="input-field"
              prefix-icon="Lock" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleRegister" class="register-btn">
              注册
            </el-button>
          </el-form-item>
        </el-form>


        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-wrapper {
  display: flex;
  min-height: 70vh;
  min-width: 60vw;
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2)
}

/* 左边区域 */
.register-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
.register-right {
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

.register-form {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  height: 44px;
  border-radius: 8px;
}

.register-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.register-btn:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}


.login-link {
  text-align: center;
  margin-top: 30px;
  font-size: 0.9rem;
  color: #666;
}

.login-link a {
  color: #667eea;
}

/* 响应式 */
@media (max-width: 768px) {
  .register-wrapper {
    flex-direction: column;
  }

  .register-left {
    min-height: 40vh;
  }
}
</style>
