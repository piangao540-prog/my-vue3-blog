
const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
    host: 'localhost',
    port: '3307',
    user: 'root',
    password: 'you520.zb',
    database: 'blog',
    charset: 'utf8mb4'
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
            res.status(500).json({ error: err.message })
            return
        }
        res.json(result)
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
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body
    db.query('SELECT id FROM users WHERE username=?', [username], (err, result) => {
        if (err) return res.status(500).json({ error: err.message })
        if (result.length > 0) {
            res.status(400).json({ error: '用户名已经存在' })
            return
        }
        db.query(
            'INSERT INTO users (username, password, role) VALUES (?,?,?)',
            [username, password, 'user'],
            (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message })
                    return
                }
                res.json({ id: result.insertId, username, role: 'user' })
            }

        )
    })
})

// 登录
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body
    db.query('SELECT * FROM users WHERE username=?', [username], (err, result) => {
        if (err) return res.status(500).json({ error: err.message })
        if (result.length === 0) {
            res.status(400).json({ error: '用户不存在' })
            return
        }
        const user = result[0]
        if (user.password !== password) {
            res.status(400).json({ error: '密码错误' })
            return
        }
        res.json({
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role
        })
    })
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
    const  username  = req.body.username
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

// 获取用户收藏文章列表
app.get('/api/articles/favorites', (req, res) => {
    db.query('SELECT article_id FROM favorites WHERE username=?',
        [req.query.username], (err, results) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json(results.map(r => r.article_id))
        })
})

app.listen(3000, () => console.log('服务器运行在 http://localhost:3000'))