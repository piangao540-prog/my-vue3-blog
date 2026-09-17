import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStreamText } from './useStreamText'

// 用假的 rAF 替换真实帧调度，这样测试可以手动"推进一帧"
let callbacks = new Map<number, FrameRequestCallback>()
let nextId = 0

const runFrames = () => {
  const pending = [...callbacks.values()]
  callbacks.clear()
  for (const cb of pending) cb(0)
}

beforeEach(() => {
  callbacks = new Map()
  nextId = 0
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = ++nextId
    callbacks.set(id, cb)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    callbacks.delete(id)
  })
})

describe('useStreamText 帧节流', () => {
  it('一帧内连续 push 多次，只渲染一次且是最新内容', () => {
    const seen: string[] = []
    const { push } = useStreamText((text) => seen.push(text))

    push('你')
    push('你好')
    push('你好呀')

    expect(seen).toEqual([]) // 还没到帧，什么都不渲染
    runFrames()
    expect(seen).toEqual(['你好呀'])
  })

  it('flush 立刻渲染，并取消排队中的那一帧', () => {
    const seen: string[] = []
    const { push, flush } = useStreamText((text) => seen.push(text))

    push('内容')
    flush()
    expect(seen).toEqual(['内容'])

    runFrames()
    expect(seen).toEqual(['内容']) // 被取消的帧不会再补一次
  })

  it('flush 之后可以重新排队', () => {
    const seen: string[] = []
    const { push, flush } = useStreamText((text) => seen.push(text))

    push('第一段')
    flush()
    push('第一段第二段')
    runFrames()

    expect(seen).toEqual(['第一段', '第一段第二段'])
  })

  it('reset 清空缓冲，残留内容不会被冲出去', () => {
    const seen: string[] = []
    const { push, reset, flush } = useStreamText((text) => seen.push(text))

    push('上一轮的内容')
    reset()
    flush()

    expect(seen).toEqual([''])
  })
})
