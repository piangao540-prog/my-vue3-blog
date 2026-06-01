import axios from './axios'

export const getAiSummary = async (content: string): Promise<string> => {
    const response = await axios.post('/ai/summary', { content })
    return response.data.summary
} 
