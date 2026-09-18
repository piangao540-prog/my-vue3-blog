async function getEmbedding(text) {
  // 每次调用时读取，避免模块加载时取到 undefined 后再也拿不到新值
  const apiKey = process.env.SILICONFLOW_API_KEY
  if (!apiKey) {
    throw new Error('缺少 SILICONFLOW_API_KEY 环境变量（Vercel 改完环境变量需要重新部署）')
  }

  const response = await fetch('https://api.siliconflow.cn/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'BAAI/bge-large-zh-v1.5',
      input: text,
    }),
  })
  const data = await response.json()
  if (!data.data?.[0]?.embedding) {
    throw new Error(`硅基流动返回异常：${JSON.stringify(data).slice(0, 200)}`)
  }
  return data.data[0].embedding // 返回数字数组
}

module.exports = { getEmbedding }
