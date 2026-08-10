import axios from './axios'

// 图片上传:传压缩后的 base64,后端返回图片 URL
export const uploadImage = async (data: string, mime: string): Promise<string> => {
    const response = await axios.post('/upload', { data, mime })
    return response.data.url
}