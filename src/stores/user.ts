import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import defaultAvatar from '@/assets/images/converted_image.png'
import { register as apiRegister, login as apiLogin } from '@/api/auth'

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
  const login = async (username: string, password: string): Promise<boolean> => {
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
      localStorage.setItem('currentuser', username)
      localStorage.setItem(`user_${username}`, JSON.stringify(password))
      return true
    } catch (error: any) {
      alert(error.response?.data?.error || '登录失败')
      return false
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
  const updateUserInfo = (info: { nickname?: string; bio?: string; avatar?: string }) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      const saved = localStorage.getItem(`user_${userInfo.value.username}`)
      if (saved) {
        const user = JSON.parse(saved)
        localStorage.setItem(`user_${userInfo.value.username}`, JSON.stringify({ ...user, ...info }))
      }
    }
  }

  // 修改密码
  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (!userInfo.value) return false

    const saved = localStorage.getItem(`user_${userInfo.value.username}`)
    if (!saved) return false

    const user = JSON.parse(saved)
    if (user.password !== oldPassword) {
      alert('原密码错误')
      return false
    }

    user.password = newPassword
    localStorage.setItem(`user_${userInfo.value.username}`, JSON.stringify(user))
    return true
  }

  // 初始化
  const init = () => {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      const saved = localStorage.getItem(`user_${currentUser}`)
      if (saved) {
        const user = JSON.parse(saved)
        userInfo.value = {
          username: user.username,
          nickname: user.nickname,
          bio: user.bio,
          avatar: user.avatar || defaultAvatar,
          role: user.role || 'user'
        }
      } else {
        userInfo.value = { username: currentUser }
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
