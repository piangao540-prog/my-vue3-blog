import { describe, it, expect } from 'vitest'
import memory from './memory'

const { mergeMemories, parseMemoryJson, similarity } = memory

describe('memory 相似度', () => {
  it('包含关系算 1', () => {
    expect(similarity('正在准备秋招', '正在准备秋招，目标是前端开发岗位')).toBe(1)
  })

  it('完全无关的内容相似度低', () => {
    expect(similarity('喜欢喝茶', '正在准备秋招')).toBeLessThan(0.5)
  })
})

describe('memory 合并逻辑', () => {
  const existing = [
    {
      id: 1,
      category: '生活状态',
      content: '正在准备秋招，目标是前端开发岗位',
      weight: 0.8,
      status: 'active',
    },
  ]

  it('相似但更新的内容 -> 更新旧记忆，不新增', () => {
    const incoming = [
      {
        category: '生活状态',
        content: '正在准备秋招，目标是前端开发岗位，已经投了几家公司',
        weight: 0.9,
      },
    ]
    const { insert, update } = mergeMemories(existing, incoming)
    expect(insert).toHaveLength(0)
    expect(update).toHaveLength(1)
    expect(update[0].id).toBe(1)
    expect(update[0].oldContent).toBe('正在准备秋招，目标是前端开发岗位')
  })

  it('完全一样的内容 -> 不产生任何变化', () => {
    const incoming = [
      { category: '生活状态', content: '正在准备秋招，目标是前端开发岗位', weight: 0.9 },
    ]
    const { insert, update } = mergeMemories(existing, incoming)
    expect(insert).toHaveLength(0)
    expect(update).toHaveLength(0)
  })

  it('新分类内容 -> 新增记忆', () => {
    const incoming = [{ category: '情绪特征', content: '面试前容易紧张', weight: 0.6 }]
    const { insert, update } = mergeMemories(existing, incoming)
    expect(insert).toHaveLength(1)
    expect(insert[0].category).toBe('情绪特征')
    expect(update).toHaveLength(0)
  })

  it('非法分类 -> 丢弃', () => {
    const incoming = [{ category: '随便写的', content: '这条不该入库', weight: 0.5 }]
    const { insert, update } = mergeMemories(existing, incoming)
    expect(insert).toHaveLength(0)
    expect(update).toHaveLength(0)
  })
})

describe('memory JSON 解析', () => {
  it('能解析带代码块的输出', () => {
    const raw = '```json\n[{"category":"基础属性","content":"喜欢喝茶","weight":0.5}]\n```'
    const parsed = parseMemoryJson(raw)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].content).toBe('喜欢喝茶')
  })

  it('解析不了的输出返回空数组', () => {
    expect(parseMemoryJson('这根本不是 JSON')).toEqual([])
    expect(parseMemoryJson('')).toEqual([])
  })
})
