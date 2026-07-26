const STOP_WORDS = new Set([
    '的', '了', '是', '在', '怎么', '什么', '如何', '为什么',
    '怎样', '这个', '那个', '吗', '吧', '啊', '呢', '呀',
    '我', '你', '他', '她', '它', '有', '就', '也', '和'
])

function extractKeywords(question){
    const parts = question.split(/[，。！？,.、\s!?]+/)
    const keywords = []

    for(const part of parts){
        if(!part) continue
        let current = ''
        for(const char of part){
            if(STOP_WORDS.has(char)){
                if(current){
                    keywords.push(current)
                    current = ''
                }
            } else{
                current += char
            }
        }
        if(current) keywords.push(current)
    }
    return keywords
}

function searchArticles(articles,keywords){
    const results = []
    for (let article of articles){
        let score = 0
        const content = (article.title + '' + (article.content || '')).toLowerCase()
        for (let keyword of keywords){
            if(content.includes(keyword.toLowerCase())){
                score++
            }
        }

        if(score > 0){
            results.push({article,score})
        }
    }

    results.sort((a,b) => b.score - a.score)
    return results.slice(0,3).map(r => r.article)
}

module.exports = {extractKeywords, searchArticles}