import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref<{ username: string; avatar?: string; nickname?: string; bio?: string } | null>(null)

  // 是否已登录
  const isLoggedIn = computed(() => !!userInfo.value)

  // 登录
  const login = (username: string, password: string): boolean => {
    const savedUser = localStorage.getItem(`user_${username}`)

    if (!savedUser) {
      alert('用户不存在')
      return false
    }

    const user = JSON.parse(savedUser)

    if (user.password !== password) {
      alert('密码错误')
      return false
    }

    userInfo.value = { username: user.username }
    localStorage.setItem('currentUser', username)
    return true
  }

  // 注册
  const register = (username: string, password: string): boolean => {
    const savedUser = localStorage.getItem(`user_${username}`)

    if (savedUser) {
      alert('用户名已存在')
      return false
    }

    localStorage.setItem(`user_${username}`, JSON.stringify({
      username,
      password,
      createdAt: new Date().toISOString()
    }))

    return true
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
          avatar: user.avatar
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
    login,
    register,
    loginOut,
    updateUserInfo,
    changePassword
  }
})
