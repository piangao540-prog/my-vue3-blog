import axios from 'axios'

// 跨境链路会随机卡死好几秒，一次卡顿就能吃掉 10 秒，超时窗口给宽一点
const TIMEOUT = 25000
const MAX_RETRY = 1
const RETRY_DELAY = 1000

// 创建 Axios 实例
const instance = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api',
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    // 没有 response 说明是超时或链路中断，属瞬时卡顿，重试一次大概率能过
    // 只重试 GET，POST 重试可能重复写入数据
    if (!error.response && config?.method === 'get' && (config.__retryCount || 0) < MAX_RETRY) {
      config.__retryCount = (config.__retryCount || 0) + 1
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return instance(config)
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (!location.pathname.startsWith('/login')) {
        // 带上当前地址，重新登录后能回到原地
        const redirect = encodeURIComponent(location.pathname + location.search)
        location.href = `/login?redirect=${redirect}`
      }
    }
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)

export default instance
