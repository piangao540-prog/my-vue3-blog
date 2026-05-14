// 标签颜色（FastAPI风格 - 淡雅色系）
const tagColors = [
    'rgba(74, 181, 60, 0.504)',
    'rgba(62, 51, 220, 0.56)',
    'rgba(238, 64, 163, 0.523)',
    'rgba(228, 86, 86, 0.55)',
    'rgba(54, 212, 149, 0.575)',
    'rgba(15, 235, 228, 0.68)',
    'rgba(252, 7, 7, 0.56)',
    'rgba(146, 54, 212, 0.575)',
    'rgba(208, 219, 54, 0.84)',
    'rgba(74, 21, 174, 0.522)',
]

// 根据标签名计算颜色（固定不变）
export const getTagColor = (tag: string) => {
    let hash = 0
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    }
    return tagColors[Math.abs(hash) % tagColors.length]
}