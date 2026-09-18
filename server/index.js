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
const { mergeMemories, parseMemoryJson, MEMORY_CATEGORIES } = require('./services/memory')

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
  ssl: process.env.VERCEL ? { rejectUnauthorized: true } : false,
})

initSchema(db)

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('缺少JWT_SECRET环境变量，服务拒绝启动')
}

// 鉴权中间件
async function auth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: '未登录' })

  try {
    const token = authHeader.split(' ')[1]
    const payload = jwt.verify(token, JWT_SECRET)
    if (!payload.id) {
      const [rows] = await db
        .promise()
        .query('SELECT id FROM users WHERE username=?', [payload.username])
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
      const [rows] = await db
        .promise()
        .query('SELECT id FROM users WHERE username=?', [payload.username])
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
    answer: String(answer || '').slice(0, 2000),
  })
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({ model: 'deepseek-v4-flash', ...params, messages }),
  })
  const data = await response.json()
  const incoming = parseMemoryJson(data.choices?.[0]?.message?.content)
  if (incoming.length === 0) return

  const [existing] = await db
    .promise()
    .query(
      'SELECT id, category, content, weight, status FROM memories WHERE user_id=? AND status="active"',
      [userId],
    )
  const { insert, update } = mergeMemories(existing, incoming)
  for (const item of insert) {
    await db
      .promise()
      .query(
        'INSERT INTO memories (user_id, category, content, weight, source_message_id) VALUES (?,?,?,?,?)',
        [userId, item.category, item.content, item.weight, sourceMessageId || null],
      )
  }
  for (const item of update) {
    await db
      .promise()
      .query('INSERT INTO memory_revisions (memory_id, old_content, new_content) VALUES (?,?,?)', [
        item.id,
        item.oldContent,
        item.newContent,
      ])
    await db
      .promise()
      .query(
        'UPDATE memories SET content=?, weight=?, source_message_id=?, updatedAt=NOW() WHERE id=?',
        [item.newContent, item.weight, sourceMessageId || null, item.id],
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
  db.query(
    'SELECT article_id FROM favorites WHERE username=?',
    [req.query.username],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results.map((r) => r.article_id))
    },
  )
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
    },
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
    },
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
    await db
      .promise()
      .query('INSERT INTO users (username, password, role) VALUES (?,?,?)', [
        username,
        hashedPassword,
        'user',
      ])
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

    const token = jwt.sign({ username: user.username, role: user.role, id: user.id }, JWT_SECRET, {
      expiresIn: '7d',
    })

    res.json({
      token,
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 查询用户信息
app.get('/api/auth/me', auth, async (req, res) => {
  const [rows] = await db
    .promise()
    .query('SELECT id,username,nickname,bio,avatar,role FROM users WHERE username=?', [
      req.user.username,
    ])
  if (rows.length == 0) return res.status(401).json({ error: '用户不存在' })
  res.json(rows[0])
})

// Ai文章摘要
app.post('/api/ai/summary', async (req, res) => {
  const { content, articleId } = req.body
  // 先查缓存
  if (!content) return res.status(400).json({ error: '缺少文章内容' })
  if (articleId) {
    const [rows] = await db
      .promise()
      .query('SELECT ai_summary FROM articles WHERE id=?', [articleId])
    if (rows[0]?.ai_summary) {
      return res.json({ summary: rows[0].ai_summary })
    }
  }

  // 流式输出
  // 用模板生成 messages 和参数
  const { messages, params } = promptBuilder.build('summary', { content })

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        ...params,
        messages,
      }),
    })
    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content || ''

    // 存缓存
    if (articleId && summary) {
      await db.promise().query('UPDATE articles SET ai_summary=? WHERE id=?', [summary, articleId])
    }
    res.json({ summary })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
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
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          {
            role: 'system',
            content:
              '你是一个博客标签推荐助手，根据标题和内容推荐3-5个中文标签，用逗号分隔，只返回标签',
          },
          { role: 'user', content: `标题：${title}\n内容：${content.slice(0, 2000)}` },
        ],
      }),
    })

    const data = await response.json()
    const tagStr = data.choices?.[0]?.message?.content || ''
    const tags = tagStr
      .split(/[,，、]/)
      .map((t) => t.trim())
      .filter(Boolean)
    res.json({ tags })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Ai智能问答助手
// Function Calling
const SEARCH_ARTICLES_TOOL = {
  type: 'function',
  function: {
    name: 'search_articles',
    description:
      '在博客文章中做向量检索。当用户的问题需要参考博客内容（技术实现、踩坑记录、作者经历）时调用；打招呼、闲聊、与博客无关的问题不要调用。',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description:
            '用于向量检索的关键词。要把用户口语化的提问改写成准确的技术关键词，例如"你那个上传的东西怎么做的"改写成"分片上传"。',
        },
      },
      required: ['keyword'],
    },
  },
}

app.post('/api/ai/chat', async (req, res) => {
  const { question, history, sessionId } = req.body
  if (!question) return res.status(400).json({ error: '缺少问题' })

  // 登录用户，判断会话
  const user = await getOptionalUser(req)
  let sessionIdNum = null
  if (user && sessionId) {
    const [rows] = await db
      .promise()
      .query('SELECT id FROM chat_sessions WHERE id=? AND user_id=?', [Number(sessionId), user.id])
    if (rows.length > 0) sessionIdNum = Number(sessionId)
  }
  if (user && !sessionIdNum) {
    const [result] = await db
      .promise()
      .query('INSERT INTO chat_sessions (user_id, title) VALUES (?,?)', [
        user.id,
        String(question).slice(0, 20),
      ])
    sessionIdNum = result.insertId
  }

  // 第 1 轮：带 tools 请求模型，让它决定"要不要查文章"和"用什么关键词查"。
  // 这一步是非流式的——只有等模型给出决定，才知道后面怎么走。
  let results = []
  let directAnswer = null
  try {
    const decideResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          {
            role: 'system',
            content:
              '你是博客助手。如果用户的问题需要参考博客文章内容才能回答，调用 search_articles 工具；如果是问候、闲聊或与博客无关的问题，直接回答。',
          },
          ...(history || []),
          { role: 'user', content: question },
        ],
        tools: [SEARCH_ARTICLES_TOOL],
      }),
    })
    const decideData = await decideResponse.json()
    const toolCall = decideData.choices?.[0]?.message?.tool_calls?.[0]

    if (toolCall) {
      // 模型决定检索：解析它给的关键词，用改写后的关键词去查向量库
      const { keyword } = JSON.parse(toolCall.function.arguments)
      results = await search(keyword || question)
    } else {
      // 模型判断这是闲聊，第一轮就把答案给出来了，后面不用再请求一次模型
      directAnswer = decideData.choices?.[0]?.message?.content || null
    }
  } catch (err) {
    // 决策失败不能把功能搞挂：退回改造前的行为，直接用原问题检索
    console.error('Function Calling 决策失败，退回直接检索:', err.message)
    results = await search(question)
  }

  const context = results
    .map((a) => `文章标题：${a.title}\n文章内容：${(a.content || '').slice(0, 800)}`)
    .join('\n---\n')
  const sources = results.map((a) => ({ articleId: a.articleId, title: a.title }))

  // 登录用户：加载已有记忆，注入到对话
  let memoryLines = []
  if (user) {
    const [memRows] = await db
      .promise()
      .query(
        'SELECT category, content FROM memories WHERE user_id=? AND status="active" ORDER BY weight DESC, updatedAt DESC LIMIT 15',
        [user.id],
      )
    memoryLines = memRows.map((r) => `[${r.category}] ${r.content}`)
  }

  // 没搜到文章、没有记忆、且模型也没直接给出答案时，用固定话术兜底。
  // 这里复用 directAnswer，让兜底话术和闲聊一样走后面统一的流式出口，
  // 避免同一个接口出现「成功时有时是 JSON、有时是 SSE」两种格式。
  if (!directAnswer && results.length === 0 && memoryLines.length === 0) {
    directAnswer = '该问题暂未在博客中收录相关内容'
  }

  try {
    // 客户端断开（用户点了停止）时，同步取消上游请求，避免白烧 token
    const upstream = new AbortController()
    res.on('close', () => {
      if (!res.writableEnded) upstream.abort()
    })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    // 前端需要知道这次问答落在哪个会话里（可能是服务端刚建的新会话）
    if (user && sessionIdNum) {
      res.write(`data: ${JSON.stringify({ sessionId: sessionIdNum })}\n\n`)
    }

    let fullAnswer = ''

    if (directAnswer) {
      // 闲聊分支：第 1 轮模型已经给出答案，不再请求一次模型
      fullAnswer = directAnswer
      res.write(`data: ${JSON.stringify({ text: fullAnswer })}\n\n`)
    } else {
      // 检索分支：带着模型改写后的关键词检索结果，生成回答
      const template = user ? 'agent-chat' : 'blog-qa'
      const { messages, params } = promptBuilder.build(template, {
        context,
        question,
        history,
        memories: memoryLines,
        username: user ? user.username : '',
      })

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          stream: true,
          ...params,
          messages,
        }),
        signal: upstream.signal,
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6)
          if (raw === '[DONE]') continue
          try {
            const chunk = JSON.parse(raw)
            const text = chunk.choices?.[0]?.delta?.content
            if (text) {
              fullAnswer += text
              res.write(`data: ${JSON.stringify({ text })}\n\n`)
            }
          } catch (e) {}
        }
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()

    // 登录用户：把这一问一答写进数据库
    if (user && sessionIdNum) {
      try {
        await db
          .promise()
          .query(
            'INSERT INTO chat_messages (session_id, user_id, role, content, sources) VALUES (?,?,?,?,?)',
            [sessionIdNum, user.id, 'user', question, null],
          )
        const [msgResult] = await db
          .promise()
          .query(
            'INSERT INTO chat_messages (session_id, user_id, role, content, sources) VALUES (?,?,?,?,?)',
            [
              sessionIdNum,
              user.id,
              'assistant',
              fullAnswer,
              sources.length ? JSON.stringify(sources) : null,
            ],
          )
        // 会话行要跟着消息一起更新：刷新 updatedAt（会话列表按它排序），
        // 并在标题还是默认值时用首条问题补上
        await db
          .promise()
          .query(
            "UPDATE chat_sessions SET title = IF(title = '新对话', LEFT(?, 20), title), updatedAt = NOW() WHERE id = ?",
            [question, sessionIdNum],
          )
        await extractMemories(user.id, question, fullAnswer, msgResult.insertId).catch(() => {})
      } catch (err) {
        console.error('保存对话失败:', err.message)
      }
    }
  } catch (err) {
    // 流开始写之后响应头已经发出，不能再改状态码，只能往流里写一条错误事件
    if (res.headersSent) {
      // 客户端已经断开时不用再写，写了也没人收
      if (!res.writableEnded && !res.destroyed) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
        res.end()
      }
      return
    }
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
      [req.user.id],
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
    const [result] = await db
      .promise()
      .query('INSERT INTO chat_sessions (user_id, title) VALUES (?,?)', [req.user.id, title])
    const [rows] = await db
      .promise()
      .query('SELECT id, title, createdAt, updatedAt FROM chat_sessions WHERE id = ?', [
        result.insertId,
      ])
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 智能体：会话消息列表
app.get('/api/chat/sessions/:id/messages', auth, async (req, res) => {
  try {
    const sessionId = Number(req.params.id)
    const [sessions] = await db
      .promise()
      .query('SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, req.user.id])
    if (sessions.length === 0) return res.status(404).json({ error: '会话不存在' })

    const [messages] = await db
      .promise()
      .query(
        'SELECT id, role, content, sources, createdAt FROM chat_messages WHERE session_id = ? ORDER BY id ASC',
        [sessionId],
      )
    res.json(
      messages.map((m) => ({
        ...m,
        sources: m.sources
          ? typeof m.sources === 'string'
            ? JSON.parse(m.sources)
            : m.sources
          : null,
      })),
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 智能体：删除会话
app.delete('/api/chat/sessions/:id', auth, async (req, res) => {
  try {
    const sessionId = Number(req.params.id)
    const [sessions] = await db
      .promise()
      .query('SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, req.user.id])
    if (sessions.length === 0) return res.status(404).json({ error: '会话不存在' })

    await db.promise().query('DELETE FROM chat_messages WHERE session_id = ?', [sessionId])
    await db.promise().query('DELETE FROM chat_sessions WHERE id = ?', [sessionId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 智能体：记忆管理（仅登录用户） =====
app.get('/api/memories', auth, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT id, category, content, weight, source_message_id, createdAt, updatedAt
             FROM memories WHERE user_id=? AND status='active'
             ORDER BY FIELD(category, '基础属性','思维认知','生活状态','情绪特征','专属经历'), updatedAt DESC`,
      [req.user.id],
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 手动新增记忆
app.post('/api/memories', auth, async (req, res) => {
  try {
    const { category, content, weight } = req.body || {}
    const cat = MEMORY_CATEGORIES.includes(category) ? category : null
    if (!cat || !content || !String(content).trim()) {
      return res.status(400).json({ error: '分类或内容无效' })
    }
    const [result] = await db
      .promise()
      .query('INSERT INTO memories (user_id, category, content, weight) VALUES (?,?,?,?)', [
        req.user.id,
        cat,
        String(content).trim(),
        Math.min(1, Math.max(0, Number(weight) || 0.5)),
      ])
    const [rows] = await db
      .promise()
      .query(
        'SELECT id, category, content, weight, createdAt, updatedAt FROM memories WHERE id=?',
        [result.insertId],
      )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 编辑记忆
app.put('/api/memories/:id', auth, async (req, res) => {
  try {
    const memoryId = Number(req.params.id)
    const [rows] = await db
      .promise()
      .query('SELECT * FROM memories WHERE id=? AND user_id=? AND status="active"', [
        memoryId,
        req.user.id,
      ])
    if (rows.length === 0) return res.status(404).json({ error: '记忆不存在' })
    const old = rows[0]
    const { category, content, weight } = req.body || {}
    const nextCategory = category && MEMORY_CATEGORIES.includes(category) ? category : old.category
    const nextContent =
      content !== undefined && String(content).trim() ? String(content).trim() : old.content
    const nextWeight =
      weight !== undefined ? Math.min(1, Math.max(0, Number(weight) || old.weight)) : old.weight
    if (String(nextContent).trim() !== String(old.content).trim()) {
      await db
        .promise()
        .query(
          'INSERT INTO memory_revisions (memory_id, old_content, new_content) VALUES (?,?,?)',
          [memoryId, old.content, nextContent],
        )
    }
    await db
      .promise()
      .query('UPDATE memories SET category=?, content=?, weight=? WHERE id=?', [
        nextCategory,
        nextContent,
        nextWeight,
        memoryId,
      ])
    const [updated] = await db
      .promise()
      .query(
        'SELECT id, category, content, weight, createdAt, updatedAt FROM memories WHERE id=?',
        [memoryId],
      )
    res.json(updated[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 删除记忆
app.delete('/api/memories/:id', auth, async (req, res) => {
  try {
    const memoryId = Number(req.params.id)
    const [result] = await db
      .promise()
      .query('UPDATE memories SET status="deleted" WHERE id=? AND user_id=?', [
        memoryId,
        req.user.id,
      ])
    if (result.affectedRows === 0) return res.status(404).json({ error: '记忆不存在' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 智能体：深度认知（复盘） =====
app.get('/api/memory/review', auth, async (req, res) => {
  try {
    const { period = 'week', refresh } = req.query
    const validPeriods = ['week', 'month', 'year', 'all']
    if (!validPeriods.includes(period)) return res.status(400).json({ error: 'period 参数无效' })
    const periodLabel = {
      week: '最近 7 天',
      month: '最近 30 天',
      year: '最近一年',
      all: '全部时间',
    }[period]
    const days = { week: 7, month: 30, year: 365 }[period]

    // 30 分钟内的缓存直接返回，避免重复调用模型
    if (!refresh) {
      const [cached] = await db
        .promise()
        .query(
          'SELECT content FROM memory_reviews WHERE user_id=? AND period=? AND createdAt > NOW() - INTERVAL 30 MINUTE',
          [req.user.id, period],
        )
      if (cached.length && cached[0].content) {
        return res.json({ period, content: cached[0].content, cached: true })
      }
    }

    const msgParams = [req.user.id]
    let msgWhere = 'user_id=?'
    if (days) {
      msgWhere += ' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)'
      msgParams.push(days)
    }

    // 聚合统计：消息总量 / 活跃日 TOP7 / 活跃时段 TOP3 / 近期用户原话
    const [totalRows] = await db
      .promise()
      .query(`SELECT COUNT(*) AS total FROM chat_messages WHERE ${msgWhere}`, msgParams)
    const [dayRows] = await db
      .promise()
      .query(
        `SELECT DATE(createdAt) AS day, COUNT(*) AS count FROM chat_messages WHERE ${msgWhere} GROUP BY day ORDER BY count DESC LIMIT 7`,
        msgParams,
      )
    const [hourRows] = await db
      .promise()
      .query(
        `SELECT HOUR(createdAt) AS hour, COUNT(*) AS count FROM chat_messages WHERE ${msgWhere} GROUP BY hour ORDER BY count DESC LIMIT 3`,
        msgParams,
      )
    const [sampleRows] = await db
      .promise()
      .query(
        `SELECT content FROM chat_messages WHERE ${msgWhere} AND role="user" AND content <> "" ORDER BY id DESC LIMIT 20`,
        msgParams,
      )

    // 记忆分类分布
    const memParams = [req.user.id]
    let memWhere = 'user_id=?'
    if (days) {
      memWhere += ' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)'
      memParams.push(days)
    }
    const [catRows] = await db
      .promise()
      .query(
        `SELECT category, COUNT(*) AS count FROM memories WHERE ${memWhere} AND status="active" GROUP BY category`,
        memParams,
      )

    const stats = [
      `总消息数：${totalRows[0]?.total || 0}`,
      `最近活跃日 TOP7：${dayRows.map((r) => `${r.day}(${r.count}条)`).join('、') || '无数据'}`,
      `活跃时段 TOP3：${hourRows.map((r) => `${r.hour}时(${r.count}条)`).join('、') || '无数据'}`,
      `记忆分类分布：${catRows.map((r) => `${r.category}(${r.count}条)`).join('、') || '无记忆'}`,
    ].join('\n')
    const samples = sampleRows.map((r) => r.content).join('\n') || '（暂无用户消息）'

    // 调模型生成复盘
    const { messages, params: llmParams } = promptBuilder.build('review', {
      periodLabel,
      stats,
      samples,
    })
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        ...llmParams,
        messages,
      }),
    })
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '复盘生成失败，请稍后重试'

    // 写入缓存（同 user + period 重复时更新）
    await db
      .promise()
      .query(
        'INSERT INTO memory_reviews (user_id, period, content) VALUES (?,?,?) ON DUPLICATE KEY UPDATE content=VALUES(content), createdAt=NOW()',
        [req.user.id, period, content],
      )
    res.json({ period, content, cached: false })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 智能体：导出与重置 =====
app.get('/api/chat/export', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.query
    const [sessions] = await db
      .promise()
      .query(
        'SELECT id, title, createdAt, updatedAt FROM chat_sessions WHERE user_id=? ORDER BY id ASC',
        [req.user.id],
      )
    const [messages] = await db
      .promise()
      .query(
        'SELECT session_id, role, content, sources, createdAt FROM chat_messages WHERE user_id=? ORDER BY id ASC',
        [req.user.id],
      )
    const [memories] = await db
      .promise()
      .query(
        'SELECT id, category, content, weight, createdAt, updatedAt FROM memories WHERE user_id=? AND status="active" ORDER BY id ASC',
        [req.user.id],
      )
    const bySession = sessions.map((s) => ({
      ...s,
      messages: messages
        .filter((m) => m.session_id === s.id)
        .map((m) => ({
          role: m.role,
          content: m.content,
          sources: m.sources
            ? typeof m.sources === 'string'
              ? JSON.parse(m.sources)
              : m.sources
            : null,
          createdAt: m.createdAt,
        })),
    }))
    const ts = new Date().toISOString().replace(/[:.]/g, '-')

    if (format === 'markdown') {
      let md = `# 个人记忆导出\n\n导出时间：${new Date().toISOString()}\n\n## 记忆库\n\n`
      md += memories.length
        ? memories.map((m) => `- [${m.category}] ${m.content}（权重 ${m.weight}）`).join('\n')
        : '（暂无记忆）'
      md += '\n\n## 对话记录\n\n'
      for (const s of bySession) {
        md += `### ${s.title}（${s.createdAt}）\n\n`
        for (const m of s.messages) {
          md += `**${m.role === 'user' ? '用户' : '助手'}**：${m.content}\n\n`
        }
      }
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="memory-${ts}.md"`)
      return res.send(md)
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="memory-${ts}.json"`)
    res.send(
      JSON.stringify(
        { exportedAt: new Date().toISOString(), sessions: bySession, memories },
        null,
        2,
      ),
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 一键重置记忆库（软删除记忆，原始对话日志保留）
app.post('/api/memory/reset', auth, async (req, res) => {
  try {
    await db.promise().query('UPDATE memories SET status="deleted" WHERE user_id=?', [req.user.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 查询用户自己的评论
app.get('/api/comments/user', (req, res) => {
  db.query(
    'SELECT * FROM comments WHERE author=? ORDER BY createdAt DESC',
    [req.query.author],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(result)
    },
  )
})

// 获取文章评论
app.get('/api/comments/:articleId', (req, res) => {
  db.query(
    'SELECT * FROM comments WHERE article_id=? ORDER BY createdAt DESC',
    [req.params.articleId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(result)
    },
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
    },
  )
})

// 删除评论
app.delete('/api/comments/:id', (req, res) => {
  db.query('DELETE FROM comments WHERE id=?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

// 更新用户信息
app.put('/api/auth/profile', (req, res) => {
  const { username, nickname, bio, avatar } = req.body
  db.query(
    'UPDATE users SET nickname=?,bio=?,avatar=? WHERE username=?',
    [nickname, bio, avatar, username],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    },
  )
})

// 修改密码
app.put('/api/auth/password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body
  try {
    const [rows] = await db
      .promise()
      .query('SELECT password FROM users WHERE username=?', [username])
    if (rows.length === 0) return res.status(400).json({ error: '用户不存在' })

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password)
    if (!isMatch) return res.status(400).json({ error: '原密码错误' })

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db
      .promise()
      .query('UPDATE users SET password=? WHERE username=?', [hashedPassword, username])

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
    [username, articleId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ favorited: result.affectedRows > 0 })
    },
  )
})

// 取消收藏
app.delete('/api/articles/:id/favorite', (req, res) => {
  const username = req.body.username
  db.query(
    'DELETE FROM favorites WHERE username=? AND article_id=?',
    [username, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    },
  )
})

// 数据统计
app.post('/api/analytics', (req, res) => {
  const { page, event, data } = req.body
  db.query(
    'INSERT INTO analytics (page,event,data) VALUES (?,?,?)',
    [page, event, JSON.stringify(data || {})],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    },
  )
})

// 统计概括
app.get('/api/analytics/summary', (req, res) => {
  const sqlPages =
    "SELECT page,COUNT(*) AS count FROM analytics WHERE event='pageview' GROUP BY page ORDER BY count DESC LIMIT 10"
  const sqlDaily =
    "SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS day,COUNT(*) AS count FROM analytics WHERE event='pageview' GROUP BY day ORDER BY day DESC LIMIT 7"

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
    { name: 'Vue3' },
    { name: 'TypeScript' },
    { name: 'Express' },
    { name: 'Echarts' },
    { name: 'Pinia' },
    { name: 'MySQL' },
  ])
})

// 获取个人信息
app.get('/api/contact-info', (req, res) => {
  res.json([
    { icon: 'User', text: 'GitHub', link: 'https://github.com/piangao540-prog' },
    { icon: 'Message', text: 'Email', link: 'mailto:piangao540prog@qq.com' },
    { icon: 'MapLocation', text: '城市', link: '#' },
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
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: '你是一个博客助手，可以调用工具搜索文章' },
          { role: 'user', content: question },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'search_articles',
              description: '在博客中搜索相关文章',
              parameters: {
                type: 'object',
                properties: {
                  keyword: { type: 'string', description: '搜索关键词' },
                },
                required: ['keyword'],
              },
            },
          },
        ],
      }),
    })

    const data = await response.json()
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0]

    //没有工具调用，直接返回Ai的回答
    if (!toolCall) {
      return res.json({ answer: data.choices?.[0]?.message?.content })
    }
    // 有工具调用，解析参数并执行
    const args = JSON.parse(toolCall.function.arguments)
    const [rows] = await db
      .promise()
      .query('SELECT id, title, content FROM articles WHERE title LIKE ? OR content LIKE ?', [
        `%${args.keyword}%`,
        `%${args.keyword}%`,
      ])

    const searchResult = rows
      .slice(0, 3)
      .map((a) => `标题：${a.title}\n内容：${(a.content || '').slice(0, 300)}`)
      .join('\n---\n')

    // 第 2 轮请求：把 tool 结果发回 AI
    const secondResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: '你是一个博客助手，可以调用工具搜索文章' },
          { role: 'user', content: question },
          data.choices[0].message, // AI 的 tool_calls
          { role: 'tool', tool_call_id: toolCall.id, content: searchResult }, // 工具结果
        ],
      }),
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
    const [result] = await db
      .promise()
      .query('INSERT INTO images (data,mime) VALUES (?,?)', [data, mime])
    res.json({ url: `/api/images/${result.insertId}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 提取图片
app.get('/api/images/:id', async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query('SELECT data, mime FROM images WHERE id=?', [req.params.id])
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
