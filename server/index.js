const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    connectionLimit: 5,
    ssl: process.env.VERCEL ? { rejectUnauthorized: true } : false
})

const JWT_SECRET = process.env.JWT_SECRET || 'blog-jwt-secret-key'


app.get('/api/articles', (req, res) => {
    db.query('SELECT * FROM articles ORDER BY createdAt DESC', (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message })
            return
        }
        res.json(result)
    })
})

// 获取用户收藏文章列表（放在文章详情之前，防止Express 把 favorites 当成 :id 参数，匹配到文章详情路由了）
app.get('/api/articles/favorites', (req, res) => {
    db.query('SELECT article_id FROM favorites WHERE username=?',
        [req.query.username], (err, results) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json(results.map(r => r.article_id))
        })
})

// 获取文章详情  ?占位符，防止 SQL 注入
app.get('/api/articles/:id', (req, res) => {
    const id = req.params.id
    db.query('SELECT * FROM articles WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message })
            return
        }
        if (results.length === 0) {
            res.status(404).json({ error: '文章不存在' })
            return
        }
        res.json(results[0])
    })
})


// 访问数据view加一
app.post('/api/articles/:id/views', (req, res) => {
    db.query('UPDATE articles SET views = views + 1 WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message })
            return
        }
        res.json({ success: true })
    })
})

// 发布文章
app.post('/api/articles', (req, res) => {
    const { title, content, summary, tags, category, status } = req.body
    db.query(
        'INSERT INTO articles (title,content,summary,tags,category,status) VALUES (?,?,?,?,?,?)',
        [title, content, summary, JSON.stringify(tags), category, status || 'draft'],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message })
                return
            }
            res.json({ id: result.insertId, message: '创建成功' })
        }
    )
})

// 更新文章
app.put('/api/articles/:id', (req, res) => {
    const { title, content, summary, tags, category, status } = req.body
    db.query(
        'UPDATE articles SET title=?,content=?,summary=?,tags=?,category=?,status=? WHERE id=?',
        [title, content, summary, JSON.stringify(tags), category, status, req.params.id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message })
                return
            }
            res.json({ success: true })
        }

    )
})

// 删除文章
app.delete('/api/articles/:id', (req, res) => {
    db.query('DELETE FROM articles WHERE id=?', [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message })
            return
        }
        res.json({ success: true })
    })
})

// 注册
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body
    try {
        const [rows] = await db.promise().query('SELECT id FROM users WHERE username=?', [username])
        if (rows.length > 0) {
            res.status(400).json({ error: '用户名已经存在' })
            return
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.promise().query(
            'INSERT INTO users (username, password, role) VALUES (?,?,?)',
            [username, hashedPassword, 'user'])
        res.json({ message: '注册成功' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 登录
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body
    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE username=?', [username])
        if (rows.length === 0) {
            res.status(400).json({ error: '用户不存在' })
            return
        }
        const user = rows[0]
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(400).json({ error: '密码错误' })
            return
        }

        const token = jwt.sign(
            { username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            token,
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

// 查询用户信息
app.get('/api/auth/me', (req, res) => {
    const { username } = req.query
    if (!username) return res.status(400).json({ error: '缺少用户名' })
    db.query('SELECT id,username,nickname,bio,avatar,role FROM users WHERE username=?',
        [username], (err, result) => {
            if (err) return res.status(500).json({ error: err.message })
            if (result.length === 0) return res.status(401).json({ error: err.message })
            res.json(result[0])
        })
})

// Ai文章摘要
app.post('/api/ai/summary', async (req, res) => {
    const { content, articleId } = req.body
    // 先查缓存
    if (!content) return res.status(400).json({ error: '缺少文章内容' })
    if (articleId) {
        const [rows] = await db.promise().query('SELECT ai_summary FROM articles WHERE id=?', [articleId])
        if (rows[0]?.ai_summary) {
            return res.json({ summary: rows[0].ai_summary })
        }
    }

    // 流式输出
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-v4-flash',
            stream: true,
            messages: [
                { role: 'system', content: '你是一个博客助手，请用一句话概括文章内容，不超过50字' },
                { role: 'user', content: content.slice(0, 2000) }
            ]
        })
    })

    let fullSummary = ''
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(a => a.startsWith('data:') && !a.includes('[DONE]'))
        for (const line of lines) {
            try {
                const data = JSON.parse(line.slice(6))
                const text = data.choices?.[0]?.delta?.content || ''
                if (text) {
                    fullSummary += text
                    res.write(`data: ${JSON.stringify({ text })}\n\n`)
                }
            } catch { }
        }
    }

    // 存缓存
    if (articleId) {
        await db.promise().query('UPDATE articles SET ai_summary=? WHERE id=?', [fullSummary, articleId])
    }
    res.write('data: [DONE]\n\n')
    res.end()
})


// 查询用户自己的评论
app.get('/api/comments/user', (req, res) => {
    db.query('SELECT * FROM comments WHERE author=? ORDER BY createdAt DESC',
        [req.query.author], (err, result) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json(result)
        })
})


// 获取文章评论
app.get('/api/comments/:articleId', (req, res) => {
    db.query('SELECT * FROM comments WHERE article_id=? ORDER BY createdAt DESC',
        [req.params.articleId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json(result)
        }
    )
})

// 添加评论
app.post('/api/comments/:articleId', (req, res) => {
    const { content, author, authorAvatar } = req.body
    if (!content || !author) return res.status(400).json({ error: '内容或作者不能为空' })
    db.query(
        'INSERT INTO comments (article_id, content, author, author_avatar) VALUES (?,?,?,?)',
        [req.params.articleId, content, author, authorAvatar || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ id: result.insertId, message: '评论成功' })
        })
})




// 删除评论
app.delete('/api/comments/:id', (req, res) => {
    db.query('DELETE FROM comments WHERE id=?', [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ success: true })
        }
    )
})




// 更新用户信息
app.put('/api/auth/profile', (req, res) => {
    const { username, nickname, bio, avatar } = req.body
    db.query(
        'UPDATE users SET nickname=?,bio=?,avatar=? WHERE username=?',
        [nickname, bio, avatar, username], (err, result) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ error: true })
        }
    )
})

// 修改密码
app.put('/api/auth/password', (req, res) => {
    const { username, oldPassword, newPassword } = req.body
    db.query('SELECT password  FROM users WHERE username=?', [username], (err, result) => {
        if (err) return res.status(500).json({ error: err.message })
        if (result[0].password !== oldPassword) {
            res.status(400).json({ error: '原密码错误' })
            return
        }
        db.query('UPDATE users SET password=? WHERE username=?', [newPassword, username], (err, result) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ success: true })
        })
    })
})

// 收藏文章
app.post('/api/articles/:id/favorite', (req, res) => {
    const username = req.body.username
    const articleId = req.params.id
    db.query(
        'INSERT IGNORE INTO favorites (username,article_id) VALUES (?,?)',
        [username, articleId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ favorited: result.affectedRows > 0 })
        }
    )
})

// 取消收藏
app.delete('/api/articles/:id/favorite', (req, res) => {
    const username = req.body.username
    db.query('DELETE FROM favorites WHERE username=? AND article_id=?',
        [username, req.params.id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ success: true })
        }
    )
})

// 数据统计
app.post('/api/analytics', (req, res) => {
    const { page, event, data } = req.body
    db.query('INSERT INTO analytics (page,event,data) VALUES (?,?,?)',
        [page, event, JSON.stringify(data || {})], (err) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ success: true })
        }
    )
})

// 统计概括
app.get('/api/analytics/summary', (req, res) => {
    const sqlPages = "SELECT page,COUNT(*) AS count FROM analytics WHERE event='pageview' GROUP BY page ORDER BY count DESC LIMIT 10"
    const sqlDaily = "SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS day,COUNT(*) AS count FROM analytics WHERE event='pageview' GROUP BY day ORDER BY day DESC LIMIT 7"

    db.query(sqlPages, (err, pages) => {
        if (err) return res.status(500).json({ error: err.message })
        db.query(sqlDaily, (err2, daily) => {
            if (err2) return res.status(500).json({ error: err2.message })
            res.json({ pages, daily })
        })
    })
})



if (!process.env.VERCEL) {
    app.listen(3000, () => console.log('服务器运行在 http://localhost:3000'))
}
module.exports = app
