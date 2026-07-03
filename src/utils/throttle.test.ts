import { describe, it, expect, vi } from 'vitest'
import { throttle } from './throttle'

describe('throttle', () => {
    it('在延迟时间内只执行一次', () => {
        const fn = vi.fn()
        const throttled = throttle(fn, 100)

        throttled()
        throttled()
        throttled()

        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('超过延迟时间后再次执行', async () => {
        const fn = vi.fn()
        const throttled = throttle(fn, 50)

        throttled()
        await new Promise(resolve => setTimeout(resolve, 60))
        throttled()

        expect(fn).toHaveBeenCalledTimes(2)
    })

    it('传递参数给原函数', () => {
        const fn = vi.fn()
        const throttled = throttle(fn, 100)

        throttled('a', 'b')
        expect(fn).toHaveBeenCalledWith('a', 'b')
    })
})
