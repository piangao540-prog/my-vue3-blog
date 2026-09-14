class PromptBuilder {
  constructor() {
    this.templates = {}
  }
  //注册一个Prompt模板
  register(name, template) {
    this.templates[name] = template
  }

  // 用模板生成最终的messages
  build(name, vars = {}) {
    const template = this.templates[name]
    if (!template) throw new Error(`模板${name}不存在`)

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
引用来源：《文章标题》`,
      },
      ...(vars.history || []),
      {
        role: 'user',
        content: vars.question,
      },
    ],
    params: {
      temperature: 0.7,
      max_tokens: 4096,
    },
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
- 不超过50字`,
      },
      {
        role: 'user',
        content: vars.content.slice(0, 2000),
      },
    ],
    params: {
      temperature: 0.3,
      max_tokens: 4096,
    },
  }
})

// 记忆模块：从文章中提取记忆
promptBuilder.register('memory-extract', (vars) => {
  return {
    messages: [
      {
        role: 'system',
        content: `# 任务
                从对话中提取值得长期记住的用户信息，输出JSON数组。
                # 分类（只能使用以下五类）
                - 基础属性：作息习惯、喜好偏好、忌口、日常行为模式
                - 生活状态：阶段性目标、烦恼、压力、计划、已完成事项、为完成述求
                - 情绪特征：容易焦虑的场景、开心的触发点、抗压能力、情绪表达方式
                - 专属经历：个人过往经历、重要事件、在意的人和事、私密述求
                # 输出格式
                [{ "category": "生活状态", "content": "正在准备秋招，目标是前端开发岗位", "weight": 0.8 }]
                - weight 表示重要程度，0~1 之间的小数
                - 没有值得记住的信息时输出[]
                - 只输出 JSON 数组，不要输出其他文字`,
      },
      {
        role: 'user',
        content: `用户说：${vars.question}\n助手回答：${vars.answer}`,
      },
    ],
    params: {
      temperature: 0.2,
      max_tokens: 4096,
    },
  }
})

// 个人智能体对话模板：文章上下文 + 用户记忆
promptBuilder.register('agent-chat', (vars) => {
  const memoryBlock =
    vars.memories && vars.memories.length ? `\n# 关于用户的记忆\n${vars.memories.join('\n')}` : ''
  const articleBlock = vars.context
    ? `# 文章上下文\n以下是用户博客中的文章内容：\n${vars.context}`
    : '# 文章上下文\n（本次没有检索到相关文章）'
  return {
    messages: [
      {
        role: 'system',
        content: `# 角色
你是一个了解用户 ${vars.username || ''} 的个人智能体，既熟悉博客内容，也记得与用户的对话。
${articleBlock}
${memoryBlock}

# 任务
- 用户问题涉及博客内容时，严格基于文章回答，不得编造，回答末尾注明引用的文章标题
- 用户只是陈述个人情况或询问个人建议时，结合记忆自然回应，不要生硬地说"未收录"
- 不要主动提及"记忆"这个内部概念`,
      },
      ...(vars.history || []),
      {
        role: 'user',
        content: vars.question,
      },
    ],
    params: {
      temperature: 0.7,
      max_tokens: 4096,
    },
  }
})

// 复盘模板：基于统计数据生成深度认知总结
promptBuilder.register('review', (vars) => {
  return {
    messages: [
      {
        role: 'system',
        content: `# 角色
你是一个深度了解用户的分析师，基于用户的真实对话数据做客观复盘。

# 任务
输出一份 Markdown 复盘，包含以下小节：
1. 总体状态：这段时间的整体情况
2. 行为规律：活跃时段、话题分布等客观规律
3. 情绪与压力：从对话中观察到的情绪特征
4. 目标推进：目标、计划及完成情况
5. 优势与短板：基于数据总结，不夸大

# 约束
- 只依据提供的数据，不编造；数据不足时明确说明
- 语言真诚、客观，不做空泛的鼓励`,
      },
      {
        role: 'user',
        content: `时间段：${vars.periodLabel}\n\n统计数据：\n${vars.stats}\n\n近期用户原话摘录：\n${vars.samples}`,
      },
    ],
    params: {
      temperature: 0.4,
      max_tokens: 4096,
    },
  }
})

module.exports = promptBuilder
