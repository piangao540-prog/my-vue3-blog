import axios from './axios'
// 引入模拟数据
import { mockTechStack, mockContactInfo, type TechStack, type ContactInfo } from './mock'
// 定义是否使用模拟数据
const USE_MOCK = (import.meta as any).env.VITE_USE_MOCK === 'true' || !(import.meta as any).env.VITE_API_URL

// 获取技术栈
export async function getTechStack(): Promise<TechStack[]> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockTechStack
    }

    const response = await axios.get('/tech-stack')
    return response.data
}

// 获取联系信息
export async function getContactInfo(): Promise<ContactInfo[]> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockContactInfo
    }

    const response = await axios.get('/contact-info')
    return response.data
}