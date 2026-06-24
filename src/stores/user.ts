import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import defaultAvatar from '@/assets/images/converted_image.png'
import { register as apiRegister, login as apiLogin, updateProfile, changePassword as apiChangePassword } from '@/api/auth'
import { getMe as apiGetMe } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref<{
    username: string; avatar?: string; nickname?: string;
    bio?: string; role?: string
  } | null>(null)

  // 是否已登录
  const isLoggedIn = computed(() => userInfo.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')

  // 登录
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await apiLogin(username, password)
      localStorage.setItem('currentUser', username)
      userInfo.value = {
        username: user.username,
        nickname: user.nickname,
        bio: user.bio,
        avatar: user.avatar || defaultAvatar,
        role: user.role || 'user'
      }
      localStorage.setItem(`user_${username}`, JSON.stringify(userInfo.value))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || '登录失败' }
    }

  }

  // 注册
  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      await apiRegister(username, password)
      return true
    } catch (error: any) {
      alert(error.response?.data?.error || '注册失败')
      return false
    }

  }

  // 登出
  const loginOut = () => {
    userInfo.value = null
    localStorage.removeItem('currentUser')
  }

  // 更新用户信息
  const updateUserInfo = async (info: { nickname?: string; bio?: string; avatar?: string }) => {
    if (!userInfo.value) return
    await updateProfile({ username: userInfo.value.username, ...info })
    userInfo.value = { ...userInfo.value, ...info }

  }

  // 修改密码
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!userInfo.value) return false
    try {
      await apiChangePassword({
        username: userInfo.value.username,
        oldPassword,
        newPassword
      })
      return true
    } catch (error: any) {
      alert(error.response?.data?.error || '修改失败')
      return false
    }
  }

  // 初始化
  const init = async () => {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      // 先立即从缓存恢复（同步）
      const cached = localStorage.getItem(`user_${currentUser}`)
      if (cached) {
        userInfo.value = JSON.parse(cached)
      }
      // 再异步验证
      try {
        const user = await apiGetMe(currentUser)
        userInfo.value = {
          username: user.username,
          nickname: user.nickname,
          bio: user.bio,
          avatar: user.avatar || defaultAvatar,
          role: user.role || 'user'
        }
      } catch {
        // 验证失败
        localStorage.removeItem('currentUser')
        userInfo.value = null
      }
    }
  }

  init()

  return {
    userInfo,
    isLoggedIn,
    isAdmin,
    login,
    register,
    loginOut,
    updateUserInfo,
    changePassword,
  }
})
