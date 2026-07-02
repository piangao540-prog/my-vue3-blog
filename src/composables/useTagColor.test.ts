import {describe, it , expect} from 'vitest'
import { getTagColor } from './useTagColor'

describe('getTagColor', () => {
    it('同样的标签页返回同样的颜色', () => {
        const color1 = getTagColor('Vue')
        const color2 = getTagColor('React')
        expect(typeof color1).toBe('string')
        expect(typeof color2).toBe('string')
    })

    it('返回的颜色是rgba格式', () =>{
        const color = getTagColor('Typescript')
        expect(color).toMatch(/^rgba\(/)
    })
})