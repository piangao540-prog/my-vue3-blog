const fs = require('fs')
const path = require('path')
const { getEmbedding } = require('./embedding')

const STORE_PATH = path.join(__dirname, '../../data/vectors.json')

// 计算余弦相似度
function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// 把文章切块
function chunkArticle(article) {
    const content = (article.content || '')
    const paragraphs = content.split('\n').filter(p => p.trim().length > 0)
    const chunks = []
    let current = ''

    for (const p of paragraphs) {
        if ((current + p).length > 500 && current.length > 0) {
            chunks.push(current.trim())
            current = ''
        }
        current += p + '\n'
    }
    if (current.trim()) chunks.push(current.trim())

    return chunks
}

// 构建向量库
async function buildVectorStore(articles) {
    const records = []
    for (const article of articles) {
        const chunks = chunkArticle(article)
        for (let i = 0; i < chunks.length; i++) {
            console.log(`向量化: ${article.title} (${i + 1}/${chunks.length})`)
            const vector = await getEmbedding(chunks[i])
            records.push({
                id: `${article.id}-${i}`,
                articleId: article.id,
                title: article.title,
                content: chunks[i].slice(0, 500),
                vector
            })
        }
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(records, null, 2))
    console.log(`向量库构建完成，共 ${records.length} 条`)
}

// 搜索
async function search(query, topK = 3) {
    const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'))
    const queryVec = await getEmbedding(query)

    const scored = data.map(record => ({
        ...record,
        score: cosineSimilarity(queryVec, record.vector)
    }))
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, topK)
}

module.exports = { buildVectorStore, search, chunkArticle }
