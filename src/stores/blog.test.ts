import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBlogStore } from './blog'
import * as articleApi from '@/api/articles'

vi.mock('@/api/articles', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/articles')>()
  return { ...actual, getArticles: vi.fn() }
})

// vitest 的 node 环境没有 localStorage，而 user store 初始化时会读它
vi.stubGlobal('localStorage', {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
})

describe('blog store - 加载失败状态', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('接口失败时 loadError 为 true，否则页面会显示成一片空白', async () => {
    vi.mocked(articleApi.getArticles).mockRejectedValue(new Error('boom'))
    const store = useBlogStore()

    await store.loadArticles(true)

    expect(store.loadError).toBe(true)
    expect(store.articles).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('接口成功时 loadError 为 false', async () => {
    vi.mocked(articleApi.getArticles).mockResolvedValue([])
    const store = useBlogStore()

    await store.loadArticles(true)

    expect(store.loadError).toBe(false)
  })

  it('失败后点重试并成功，loadError 要回到 false', async () => {
    const store = useBlogStore()

    vi.mocked(articleApi.getArticles).mockRejectedValueOnce(new Error('boom'))
    await store.loadArticles(true)
    expect(store.loadError).toBe(true)

    vi.mocked(articleApi.getArticles).mockResolvedValue([])
    await store.loadArticles(true)
    expect(store.loadError).toBe(false)
  })
})
