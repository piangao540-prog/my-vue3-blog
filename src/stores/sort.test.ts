import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSortStore } from './sort'

describe('sort store - compareByKey', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('按creatAt排序', () => {
        const store = useSortStore()
        const a = { createdAt: '2026-01-01' }
        const b = { createdAt: '2026-04-01' }

        expect(store.compareByKey(a, b, 'createdAt')).toBeLessThan(0)
        expect(store.compareByKey(b, a, 'createdAt')).toBeGreaterThan(0)

    })

    it('按 liked 排序', () => {
        const store = useSortStore()
        const liked = { like: true }
        const unliked = { like: false }
        expect(store.compareByKey(liked, unliked, 'liked')).toBeGreaterThan(0)
    })
})