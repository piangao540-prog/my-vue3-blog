import axios from './axios'

// 注册
export const register = async (username: string, password: string) => {
    const response = await axios.post('/auth/register', { username, password })
    return response.data
}

// 登录
export const login = async (username: string, password: string) => {
    const response = await axios.post('/auth/login', { username, password })
    return response.data
}

// 更新用户信息
export const updateProfile = async (data: {
    username: string
    nickname?: string
    bio?: string
    avatar?: string
}) => {
    const response = await axios.post('/auth/profile', data)
    return response.data
}

// 修改密码
export const changePassword = async (data: {
    username: string
    oldPassword: string
    newPassword: string
}) => {
    const response = await axios.post('/auth/profile', data)
    return response.data
}