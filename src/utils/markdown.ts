import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from '@/utils/highlight'

// marked 是单例，渲染器配置一次就够了（原来两个组件各配了一遍，是重复的）
const renderer = new marked.Renderer()
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}

marked.use({ renderer })

/**
 * markdown 转成可以交给 v-html 的 HTML。
 *
 * 两层保护：
 * 1. 补齐未闭合的代码块——流式输出时代码块常常只到一半，
 *    不补齐会让后面的内容全被当成代码渲染，画面抖动。
 * 2. DOMPurify 净化——模型输出属于不可信内容（可能被提问诱导输出 HTML 或脚本），
 *    marked 自身不做净化，直接丢给 v-html 就是 XSS。
 */
export const renderMarkdown = (content: string) => {
  const openFences = (content.match(/```/g) || []).length
  const safe = openFences % 2 !== 0 ? content + '\n```' : content
  return DOMPurify.sanitize(marked.parse(safe) as string)
}
