import { describe, it, expect } from 'vitest'
import { formatTime } from './useComments'

describe('formatTime', () => {
    it('把日期字符串转成 YYYY-MM-DD HH:mm 格式', () => {
        const result = formatTime('2025-06-28T10:30:00')
        expect(result).toBe('2025-06-28 10:30')
    })
    it('月份和日期补零',() => {
        const result = formatTime('2026-02-01T23:59:59')
        expect(result).toBe('2026-02-01 23:59')
    })
})