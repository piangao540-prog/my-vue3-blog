class PromptBuilder{
    constructor(){
        this.templates = {}
    }
    //注册一个Prompt模板
    register(name,template){
        this.templates[name] = template
    }

    // 用模板生成最终的messages
    build(name, vars ={}){
        const template = this.templates[name]
        if(!template) throw new Error(`模板${name}不存在`)

        return template(vars)
    }
}

// 导出单例
const promptBuilder = new PromptBuilder()

// 注册博客问答模板
promptBuilder.register('blog-qa', (vars) => {
    return {
        messages: [
            {
                role: 'system',
                content: `# 角色
你是一个专业的博客问答助手。

# 上下文
以下是用户博客中的文章内容：
${vars.context}

# 任务
基于上述文章内容回答用户的问题。

# 约束
- 严格基于文章内容回答，不得编造
- 如果文章内容不足以回答问题，回复"该问题暂未在博客中收录相关内容"
- 回答末尾注明引用的文章标题

# 输出格式
回答内容（可包含 markdown 格式）

---
引用来源：《文章标题》`
            },
            ...(vars.history || []),
            {
                role: 'user',
                content: vars.question
            }
        ],
        params: {
            temperature: 0.7,
            max_tokens: 1024
        }
    }
})

// 文章摘要模板
promptBuilder.register('summary', (vars) => {
    return {
        messages: [
            {
                role: 'system',
                content: `# 角色
你是一个专业的博客文章摘要助手。

# 任务
用一句话概括文章的核心内容，不超过50字。

# 约束
- 只输出摘要本身，不要额外说明
- 不超过50字`
            },
            {
                role: 'user',
                content: vars.content.slice(0, 2000)
            }
        ],
        params: {
            temperature: 0.3,
            max_tokens: 100
        }
    }
})

module.exports = promptBuilder