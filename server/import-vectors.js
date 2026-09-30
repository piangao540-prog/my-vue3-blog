const mysql = require('mysql2')
require('dotenv').config()
const { buildVectorStore } = require('./services/vector-store')

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

async function main() {
  const [articles] = await db
    .promise()
    .query('SELECT * FROM articles WHERE status = ?', ['published'])
  const [interviews] = await db
    .promise()
    .query('SELECT id, company_public, position, questions, content FROM interviews WHERE status = ?', [
      'published',
    ])
  console.log(`读取到 ${articles.length} 篇文章，${interviews.length} 篇面试经历`)

  // 两张表统一成 { type, refId, title, content }，向量库不关心数据来自哪张表
  const docs = [
    ...articles.map((a) => ({ type: 'article', refId: a.id, title: a.title, content: a.content })),
    ...interviews.map((iv) => ({
      type: 'interview',
      refId: iv.id,
      title: `${iv.company_public} ${iv.position} 面试经历`,
      content: `面试题：${iv.questions || ''}\n${iv.content || ''}`,
    })),
  ]

  await buildVectorStore(docs)
  process.exit(0)
}

main()
