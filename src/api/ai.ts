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
            } catch { }
        }
    }
    return fullSummary


}

export const getAiTags = async (content: string, title?: string): Promise<string[]> => {
    const base = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
    const response = await fetch(`${base}/api/ai/tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title })
    })
    const data = await response.json()
    return data.tags || []
}

export const getChat = async (
    question: string,
    history:{role:string;content: string}[], 
    signal: AbortSignal,
    onText: (text: string) => void
    ): Promise<string> => {
    const base = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
    const response = await fetch(`${base}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question,history }),
        signal
    })

    let fullAnswer = ''
    const ct = response.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
        const data = await response.json()
        onText(data.answer || '该问题暂未在博客中收录相关内容')
        return data.answer || ''
    }
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
            if (!line.startsWith('data:') || line.includes('[DONE]')) continue
            try {
                const data = JSON.parse(line.slice(6))
                const text = data.text || ''
                fullAnswer += text
                onText(fullAnswer)
            } catch { }
        }
    }
    return fullAnswer
}
