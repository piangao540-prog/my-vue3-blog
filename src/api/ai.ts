export const getAiSummary = async (
    content: string,
    articleId: number,
    onText: (text: string) => void
): Promise<string> => {
    const base = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
    const response = await fetch(`${base}/api/ai/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, articleId })
    })

    const ct = response.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
        const data = await response.json()
        if (data.summary) {
            onText(data.summary)
            return data.summary
        }
        return ''
    }

    let fullSummary = ''
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(a => a.startsWith('data:') && !a.includes('[DONE]'))
        for (const line of lines) {
            try {
                const data = JSON.parse(line.slice(6))
                const text = data.text || ''
                fullSummary += text
                onText(fullSummary)
            } catch {}
        }
    }
    return fullSummary


}
