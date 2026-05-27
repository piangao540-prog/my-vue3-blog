const fs = require('fs')
const path = require('path')
const mysql = require('mysql2')

// 读取 TypeScript 源文件
const tsContent = fs.readFileSync(path.join(__dirname, '../src/data/articles.ts'), 'utf-8')

// 去掉 import 行，并把 export 转成 CommonJS 格式（兼容 Windows \r\n）
let jsContent = tsContent
    .replace(/^import.*?(\r)?$/gm, '')     // 删掉 import 行
    .replace('export const articleList: Article[] =', 'module.exports =')  // 转成导出

// 写入临时 JS 文件
const tempFile = path.join(__dirname, '_temp_articles.js')
fs.writeFileSync(tempFile, jsContent)

// 加载数据（直接导出数组，非解构）
const articleList = require('./_temp_articles.js')

// 删掉临时文件
fs.unlinkSync(tempFile)

console.log(`读取到 ${articleList.length} 篇文章`)

// 连接数据库并导入
const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'you520.zb',
    database: 'blog'
})

db.connect(err => {
    if (err) {
        console.error('数据库连接失败:', err)
        process.exit(1)
    }

    db.query('DELETE FROM articles', (err) => {
        if (err) {
            console.error('清空失败:', err)
            db.end()
            return
        }
        console.log('已清空旧数据，开始导入...')

        let inserted = 0
        articleList.forEach(article => {
            db.query(
                'INSERT INTO articles (title, content, summary, tags, category, views, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [article.title, article.content, article.summary, JSON.stringify(article.tags), article.category, article.views, 'published', article.createdAt],
                (err) => {
                    if (err) {
                        console.error('插入失败:', article.title, err.message)
                    } else {
                        console.log('  OK ' + article.title)
                    }
                    inserted++
                    if (inserted === articleList.length) {
                        console.log('导入完成！共 ' + articleList.length + ' 篇文章')
                        db.end()
                    }
                }
            )
        })
    })
})
