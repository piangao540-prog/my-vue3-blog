
const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'you520.zb',
    database: 'blog'
})

db.connect(err => {
    if (err) {
        console.log('数据库连接失败:', err)
        return
    }
    console.log('MySQL已连接')
})

app.get('/api/articles', (req, res) => {
    db.query('SELECT * FROM articles ORDER BY createdAt DESC', (err, result) => {
        if (err) {
            res.status(500).json({error: err.message})
            return
        }
        res.json(result)
    })
})




app.listen(3000, () => console.log('服务器运行在 http://localhost:3000'))