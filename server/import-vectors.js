const mysql = require('mysql2')
require('dotenv').config()
const { buildVectorStore } = require('./services/vector-store')

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

async function main() {
    const [articles] = await db.promise().query('SELECT * FROM articles WHERE status = ?', ['published'])
    console.log(`读取到 ${articles.length} 篇文章`)
    await buildVectorStore(articles)
    process.exit(0)
}

main()
