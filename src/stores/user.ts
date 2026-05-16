import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref<{ username: string; avatar?: string } | null>(null)
  
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
  const logout = () => {
    userInfo.value = null
    localStorage.removeItem('currentUser')
  }
  
  // 初始化
  const init = () => {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      userInfo.value = { username: currentUser }
    }
  }
  
  init()
  
  return {
    userInfo,
    isLoggedIn,
    login,
    register,
    logout
  }
})
