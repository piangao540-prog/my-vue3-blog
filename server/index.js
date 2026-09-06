const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { error } = require('node:console')
const { extractKeywords, searchArticles } = require('./services/rag')
const promptBuilder = require('./services/promptBuilder')
require('dotenv').config()
const { json } = require('node:stream/consumers')
const { search } = require('./services/vector-store')
const { initSchema } = require('./services/schema')
const { mergeMemories, parseMemoryJson } = require('./services/memory')

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' })) //放宽body上限

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

initSchema(db)

const JWT_SECRET = process.env.JWT_SECRET || 'blog-jwt-secret-key'

// 鉴权中间件
async function auth(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: '未登录' })

    try {
        const token = authHeader.split(' ')[1]
        const payload = jwt.verify(token, JWT_SECRET)
        if (!payload.id) {
            const [rows] = await db.promise().query(
                'SELECT id FROM users WHERE username=?',
                [payload.username]
            )
            if (rows.length === 0) return res.status(401).json({ error: 'token无效' })
            payload.id = rows[0].id
        }
        req.user = payload
        next()
    } catch {
        res.status(401).json({ error: 'token无效' })
    }
}

// 可选登录：用于使用智能体
async function getOptionalUser(req) {
    const authHeader = req.headers.authorization
    if (!authHeader) return null
    try {
        const token = authHeader.split(' ')[1]
        const payload = jwt.verify(token, JWT_SECRET)
        if (!payload.id) {
            const [rows] = await db.promise().query('SELECT id FROM users WHERE username=?', [payload.username])
            if (rows.length === 0) return null
            payload.id = rows[0].id
        }
        return payload
    } catch (err) {
        return null
    }
}

// 从对话中提炼记忆（回答完成后调用，失败不影响聊天本身）
async function extractMemories(userId, question, answer, sourceMessageId) {
    const { messages, params } = promptBuilder.build('memory-extract', {
        question: String(question || '').slice(0, 2000),
        answer: String(answer || '').slice(0, 2000)
    })
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({ model: 'deepseek-v4-flash', ...params, messages })
    })
    const data = await response.json()
    const incoming = parseMemoryJson(data.choices?.[0]?.message?.content)
    if (incoming.length === 0) return

    const [existing] = await db.promise().query(
        'SELECT id, category, content, weight, status FROM memories WHERE user_id=? AND status="active"',
        [userId]
    )
    const { insert, update } = mergeMemories(existing, incoming)
    for (const item of insert) {
        await db.promise().query(
            'INSERT INTO memories (user_id, category, content, weight, source_message_id) VALUES (?,?,?,?,?)',
            [userId, item.category, item.content, item.weight, sourceMessageId || null]
        )
    }
    for (const item of update) {
        await db.promise().query(
            'INSERT INTO memory_revisions (memory_id, old_content, new_content) VALUES (?,?,?)',
            [item.id, item.oldContent, item.newContent]
        )
        await db.promise().query(
            'UPDATE memories SET content=?, weight=?, source_message_id=?, updatedAt=NOW() WHERE id=?',
            [item.newContent, item.weight, sourceMessageId || null, item.id]
        )
    }
}

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
            { username: user.username, role: user.role, id: user.id },
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
app.get('/api/auth/me', auth, async (req, res) => {
    const [rows] = await db.promise().query(
        'SELECT id,username,nickname,bio,avatar,role FROM users WHERE username=?',
        [req.user.username]
    )
    if (rows.length == 0) return res.status(401).json({ error: '用户不存在' })
    res.json(rows[0])
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

    // 用模板生成 messages 和参数
    const { messages, params } = promptBuilder.build('summary', { content })

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-v4-flash',
            stream: true,
            ...params,
            messages,
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

// AI推荐tag标签
app.post('/api/ai/tag', async (req, res) => {
    const { content, title } = req.body
    if (!content) return res.status(400).json({ error: '缺少文章内容' })

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-v4-flash',
                messages: [
                    { role: 'system', content: '你是一个博客标签推荐助手，根据标题和内容推荐3-5个中文标签，用逗号分隔，只返回标签' },
                    { role: 'user', content: `标题：${title}\n内容：${content.slice(0, 2000)}` }
                ]
            })
        })

        const data = await response.json()
        const tagStr = data.choices?.[0]?.message?.content || ''
        const tags = tagStr.split(/[,，、]/).map(t => t.trim()).filter(Boolean)
        res.json({ tags })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Ai智能问答助手
app.post('/api/ai/chat', async (req, res) => {
    const { question, history, sessionId } = req.body
    if (!question) return res.status(400).json({ error: '缺少问题' })

    // 登录用户，判断会话
    const user = await getOptionalUser(req)
    let sessionIdNum = null
    if (user && sessionId) {
        const [rows] = await db.promise().query(
            'SELECT id FROM chat_sessions WHERE id=? AND user_id=?',
            [Number(sessionId), user.id]
        )
        if (rows.length > 0)  sessionIdNum = Number(sessionId)
    }
    if (user && !sessionIdNum) {
        const [result] = await db.promise().query(
            'INSERT INTO chat_sessions (user_id, title) VALUES (?,?)',
            [user.id, String(question).slice(0, 20)]
        )
        sessionIdNum = result.insertId
    }


    const results = await search(question)
    const context = results.map(a =>
        `文章标题：${a.title}\n文章内容：${(a.content || '').slice(0, 800)}`
    ).join('\n---\n')
    const sources = results.map(a => ({articleId: a.articleId, title: a.title}))

    if (results.length === 0) {
        const answer = '该问题暂未在博客中收入相关内容'
        if (user && sessionIdNum) {
            try {
                await db.promise().query(
                    'INSERT INTO chat_messages (session_id, user_id, role, content, sources) VALUES (?,?,?,?,?)',
                    [sessionIdNum, user.id, 'user', question, null]
                )
                await db.promise().query(
                    'INSERT INTO chat_messages (session_id, user_id, role, content, sources) VALUES (?,?,?,?,?)',
                    [sessionIdNum, user.id, 'assistant', answer, null]
                )
            } catch (err) {
                console.error('保存对话失败:', err.message)
            }
        }
        await extractMemories(user.id, question, answer, null).catch(() => {})
        return res.json({ answer, sessionId: sessionIdNum || undefined })
    }  

    try {
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        if(user){
            res.write(`data: ${JSON.stringify({ sessionId: sessionIdNum})}\n\n`)
        }

        const { messages, params } = promptBuilder.build('blog-qa', {
            context,
            question,
            history
        })

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-v4-flash',
                stream: true,
                ...params,
                messages
            })
        })

        let fullAnswer = ''
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
                        fullAnswer += text
                        res.write(`data: ${JSON.stringify({ text })}\n\n`)
                    }
                } catch { }
            }
        }

        // 登录用户：流式结束后把这一问一答写进数据库
        if (user && sessionIdNum) {
            try {
                await db.promise().query(
                    'INSERT INTO chat_messages (session_id, user_id, role, content, sources) VALUES (?,?,?,?,?)',
                    [sessionIdNum, user.id, 'user', question, null]
                )
                const [msgResult] = await db.promise().query(
                    'INSERT INTO chat_messages (session_id, user_id, role, content, sources) VALUES (?,?,?,?,?)',
                    [sessionIdNum, user.id, 'assistant', fullAnswer, sources.length ? JSON.stringify(sources) : null]
                )
                await extractMemories(user.id, question, fullAnswer, msgResult.insertId).catch(() => {})
            } catch (err) {
                console.error('保存对话失败:', err.message)
            }
        }

        res.write('data: [DONE]\n\n')
        res.end()

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 智能体：会话列表
app.get('/api/chat/sessions', auth, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT s.id, s.title, s.createdAt, s.updatedAt, COUNT(m.id) AS messageCount
            FROM chat_sessions s LEFT JOIN chat_messages m ON m.session_id = s.id
            WHERE s.user_id = ? GROUP BY s.id ORDER BY s.updatedAt DESC`,
            [req.user.id]
        )
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 智能体：新建会话
app.post('/api/chat/sessions', auth, async (req, res) => {
    try {
        const title = req.body.title || '新对话'
        const [result] = await db.promise().query(
            'INSERT INTO chat_sessions (user_id, title) VALUES (?,?)',
            [req.user.id, title]
        )
        const [rows] = await db.promise().query(
            'SELECT id, title, createdAt, updatedAt FROM chat_sessions WHERE id = ?',
            [result.insertId]
        )
        res.json(rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 智能体：会话消息列表
app.get('/api/chat/sessions/:id/messages', auth, async (req, res) => {
    try {
        const sessionId = Number(req.params.id)
        const [sessions] = await db.promise().query(
            'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
            [sessionId, req.user.id]
        )
        if (sessions.length === 0) return res.status(404).json({ error: '会话不存在' })

        const [messages] = await db.promise().query(
            'SELECT id, role, content, sources, createdAt FROM chat_messages WHERE session_id = ? ORDER BY id ASC',
            [sessionId]
        )
        res.json(messages.map(m => ({
            ...m,
            sources: m.sources ? (typeof m.sources === 'string' ? JSON.parse(m.sources) : m.sources) : null
        })))
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 智能体：删除会话
app.delete('/api/chat/sessions/:id', auth, async (req, res) => {
    try {
        const sessionId = Number(req.params.id)
        const [sessions] = await db.promise().query(
            'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
            [sessionId, req.user.id]
        )
        if (sessions.length === 0) return res.status(404).json({ error: '会话不存在' })

        await db.promise().query('DELETE FROM chat_messages WHERE session_id = ?', [sessionId])
        await db.promise().query('DELETE FROM chat_sessions WHERE id = ?', [sessionId])
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
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
            res.json({ success: true })
        }
    )
})

// 修改密码
app.put('/api/auth/password', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body
    try {
        const [rows] = await db.promise().query('SELECT password FROM users WHERE username=?', [username])
        if (rows.length === 0) return res.status(400).json({ error: '用户不存在' })

        const isMatch = await bcrypt.compare(oldPassword, rows[0].password)
        if (!isMatch) return res.status(400).json({ error: '原密码错误' })

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await db.promise().query('UPDATE users SET password=? WHERE username=?', [hashedPassword, username])

        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
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


// 获取技术栈
app.get('/api/tech-stack', (req, res) => {
    res.json([
        { name: 'Vue3' }, { name: 'TypeScript' }, { name: 'Express' },
        { name: 'Echarts' }, { name: 'Pinia' }, { name: 'MySQL' }
    ])
})

// 获取个人信息
app.get('/api/contact-info', (req, res) => {
    res.json([
        { icon: 'User', text: 'GitHub', link: 'https://github.com/piangao540-prog' },
        { icon: 'Message', text: 'Email', link: 'mailto:piangao540prog@qq.com' },
        { icon: 'MapLocation', text: '城市', link: '#' }
    ])
})

// Function Calling 
app.post('/api/ai/tool-demo', async (req, res) => {
    const { question } = req.body
    if (!question) return res.status(400).json({ error: '缺少问题' })

    try {
        // 第 1 轮：带 tools 请求 DeepSeek
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-v4-flash',
                messages: [
                    { role: 'system', content: '你是一个博客助手，可以调用工具搜索文章' },
                    { role: 'user', content: question }
                ],
                tools: [{
                    type: 'function',
                    function: {
                        name: 'search_articles',
                        description: '在博客中搜索相关文章',
                        parameters: {
                            type: 'object',
                            properties: {
                                keyword: { type: 'string', description: '搜索关键词' }
                            },
                            required: ['keyword']
                        }
                    }
                }]
            })
        })

        const data = await response.json()
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0]

        //没有工具调用，直接返回Ai的回答
        if (!toolCall) {
            return res.json({ answer: data.choices?.[0]?.message?.content })
        }
        // 有工具调用，解析参数并执行
        const args = JSON.parse(toolCall.function.arguments)
        const [rows] = await db.promise().query(
            'SELECT id, title, content FROM articles WHERE title LIKE ? OR content LIKE ?',
            [`%${args.keyword}%`, `%${args.keyword}%`]
        )

        const searchResult = rows.slice(0, 3).map(a =>
            `标题：${a.title}\n内容：${(a.content || '').slice(0, 300)}`
        ).join('\n---\n')

        // 第 2 轮请求：把 tool 结果发回 AI
        const secondResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-v4-flash',
                messages: [
                    { role: 'system', content: '你是一个博客助手，可以调用工具搜索文章' },
                    { role: 'user', content: question },
                    data.choices[0].message,                          // AI 的 tool_calls
                    { role: 'tool', tool_call_id: toolCall.id, content: searchResult }  // 工具结果
                ]
            })
        })
        const secondData = await secondResponse.json()
        res.json({ answer: secondData.choices?.[0]?.message?.content })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 图片上传 前端压缩base64                            
app.post('/api/upload', async (req, res) => {
    const { data, mime } = req.body

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(mime)) {
        return res.status(400).json({ error: '不支持的图片类型' })
    }

    if (data.length > 2000000) {
        return res.status(400).json({ error: '图片太大，请压缩后再传' })
    }

    try {
        const [result] = await db.promise().query(
            'INSERT INTO images (data,mime) VALUES (?,?)',
            [data, mime]
        )
        res.json({ url: `/api/images/${result.insertId}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 提取图片
app.get('/api/images/:id', async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            'SELECT data, mime FROM images WHERE id=?', [req.params.id]
        )
        if (rows.length === 0) return res.status(400).json({ error: '图片不存在' })

        res.setHeader('Content-Type', rows[0].mime)
        res.setHeader('Cache-Control', 'public,max-age=86400')
        res.send(Buffer.from(rows[0].data, 'base64'))
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

if (!process.env.VERCEL) {
    app.listen(3000, () => console.log('服务器运行在 http://localhost:3000'))
}
module.exports = app
