const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY

async function getEmbedding(text) {
    const response = await fetch('https://api.siliconflow.cn/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
        },
        body: JSON.stringify({
            model: 'BAAI/bge-large-zh-v1.5',
            input: text
        })
    })
    const data = await response.json()
    return data.data[0].embedding  // 返回数字数组
}

module.exports = { getEmbedding }

