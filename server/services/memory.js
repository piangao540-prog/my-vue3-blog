// 记忆提炼相关纯函数（不依赖数据库，便于单元测试）
const MEMORY_CATEGORIES = ['基础属性', '思维认知', '生活状态', '情绪特征', '专属经历']

// 校验分类，非法分类返回 null（你之前把它写进了 normalizeText，名字不对）
function normalizeCategory(category) {
  return MEMORY_CATEGORIES.includes(category) ? category : null
}

// 归一化文本：去掉所有空白（这个函数之前整个丢了）
function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, '')
    .trim()
}

// 字符二元组集合（你循环条件写成了 grams.length，应是 text.length）
function bigrams(text) {
  const grams = new Set()
  for (let i = 0; i < text.length - 1; i++) {
    grams.add(text.slice(i, i + 2))
  }
  return grams
}

// 相似度：包含关系算 1，否则用二元组 Jaccard（if 少了括号 + retrun 拼错）
function similarity(a, b) {
  const A = normalizeText(a)
  const B = normalizeText(b)
  if (!A || !B) return 0
  if (A === B || A.includes(B) || B.includes(A)) return 1
  const ga = bigrams(A)
  const gb = bigrams(B)
  let inter = 0
  for (const g of ga) {
    if (gb.has(g)) inter++
  }
  const union = ga.size + gb.size - inter
  return union === 0 ? 0 : inter / union
}

// 合并：existing 是库里已有的 active 记忆，incoming 是模型刚抽出来的
function mergeMemories(existing, incoming, threshold = 0.5) {
  const active = existing.filter((m) => m.status === 'active')
  const matchedIds = new Set()
  const insert = []
  const insertKeys = new Set()
  const update = []

  for (const inc of incoming) {
    const category = normalizeCategory(inc.category)
    const content = normalizeText(inc.content)
    if (!category || !content) continue
    const weight = Math.min(1, Math.max(0, Number(inc.weight) || 0.5)) // 你漏了这行
    const key = category + '|' + content // 你少了个 + 号
    if (insertKeys.has(key)) continue

    let best = null
    let bestScore = 0
    for (const m of active) {
      if (m.category !== category || matchedIds.has(m.id)) continue
      const score = similarity(m.content, inc.content)
      if (score > bestScore) {
        bestScore = score
        best = m
      }
    }

    if (best && bestScore >= threshold) {
      const oldContent = String(best.content || '')
      if (normalizeText(oldContent) === content) continue
      matchedIds.add(best.id)
      update.push({ id: best.id, oldContent, newContent: inc.content, weight })
    } else {
      insertKeys.add(key)
      insert.push({ category, content: inc.content, weight })
    }
  }

  return { insert, update }
}

// 从模型输出里抠出 JSON 数组（容忍代码块/多余文字）
function parseMemoryJson(raw) {
  if (!raw) return []
  let text = String(raw).trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) text = fence[1].trim()
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) return []
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) // 你写成 silce
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) =>
        // 你写成 parse
        item && typeof item === 'object' && typeof item.content === 'string' && item.content.trim(),
    )
  } catch {
    return [] // 你写成 retrun
  }
}

module.exports = {
  MEMORY_CATEGORIES,
  normalizeCategory,
  normalizeText,
  similarity,
  mergeMemories,
  parseMemoryJson,
}
