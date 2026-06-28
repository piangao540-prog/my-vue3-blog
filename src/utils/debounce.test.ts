import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { debounce } from "./debounce"

describe('decounce', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('快速多次调用只执行一次', () => {
        
        const fn = vi.fn()
        const debounced = debounce(fn, 1000)

        debounced()
        debounced()
        debounced()

        vi.advanceTimersByTime(1000)

        expect(fn).toHaveBeenCalledTimes(1)

        
    })
    it('传递参数给原函数', () => {
        
        const fn = vi.fn()
        const debounced = debounce(fn, 1000)

        debounced('hello', 42)
        vi.advanceTimersByTime(1000)

        expect(fn).toHaveBeenCalledWith('hello', 42)

        
    })
})