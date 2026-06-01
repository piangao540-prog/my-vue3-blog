import axios from './axios'

export const getAiSummary = async (content: string, articleId: number): Promise<string> => {
    const response = await axios.post('/ai/summary', { content, articleId })
    return response.data.summary
} 
