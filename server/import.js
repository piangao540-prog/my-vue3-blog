const mysql = require('mysql2')

const articles = [
  {
    title: '我的第一篇博客',
    summary: '这是博客项目的第一篇示例文章，介绍如何搭建一个现代化的博客系统。',
    content: `
            <p>欢迎来到我的技术博客！这是一篇介绍博客搭建的文章。</p>
            <h2>技术栈</h2>
            <ul>
                <li>Vue3 - 渐进式JavaScript框架</li>
                <li>TypeScript - JavaScript的超集，提供类型检查</li>
                <li>Vite - 下一代前端构建工具</li>
                <li>Element Plus - 基于Vue3的组件库</li>
                <li>Pinia - 状态管理库</li>
                <li>Echarts - 一个基于 JavaScript 的开源可视化图表库</li>
            </ul>
            <h2>项目结构</h2>
            <p>我们的博客项目采用模块化设计，便于维护和扩展。</p>
        `,
    tags: ['Vue3', 'Vite', 'Element Plus', 'TypeScript', 'Pinia', 'Echarts'],
    category: '技术分享',
    views: 0,
    createdAt: '2026-05-05'
  },
  {
    title: 'Vue3 组合式 API 详解',
    summary: '深入了解 Vue3 的组合式 API，包括 ref、reactive、computed、watch 等核心概念及其最佳实践。',
    content: `
            <p>Vue3 引入了组合式 API（Composition API），这是一个强大的新特性，彻底改变了 Vue 应用的开发方式。</p>
            <h2>为什么需要组合式 API？</h2>
            <p>在 Vue2 中，我们使用选项式 API（Options API），虽然简单直观，但在处理复杂逻辑时会遇到一些问题：</p>
            <ul>
                <li>逻辑关注点分散：相关的代码被分散到不同的选项中</li>
                <li>逻辑复用困难：Mixin 存在命名冲突和来源不清晰的问题</li>
                <li>类型推断不足：TypeScript 支持不够完善</li>
            </ul>
            <p>组合式 API 提供了更好的逻辑复用和代码组织方式，让我们能够将相关的逻辑组织在一起。</p>
            <h2>核心概念</h2>
            <h3>ref 和 reactive（就是简单ref,复杂reactive）</h3>
            <p><strong>ref</strong> 用于基本类型数据，通过 .value 访问和修改：</p>
            <pre><code>const count = ref(0)
console.log(count.value) // 0
count.value++
console.log(count.value) // 1</code></pre>
            <p><strong>reactive</strong> 用于对象类型数据，可以直接访问属性：</p>
            <pre><code>const state = reactive({
  name: '张三',
  age: 25
})
console.log(state.name) // '张三'
state.age++ // 26</code></pre>
            <h3>computed</h3>
            <p>一个小细节：computed本身是一个ref,取值时需要使用.value</p>
            <p>计算属性用于处理复杂的逻辑计算，具有缓存特性：</p>
            <pre><code>const firstName = ref('张')
const lastName = ref('三')

const fullName = computed(() => {
  return firstName.value + lastName.value
})

console.log(fullName.value) // '张三'</code></pre>
            <h3>watch</h3>
            <p>监听数据变化并执行相应的操作：</p>
            <pre><code>const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(\\x60count 从 \\x24{oldVal} 变成了 \\x24{newVal}\\x60)
})

count.value++ // 输出: count 从 0 变成了 1</code></pre>
            <h3>watchEffect</h3>
            <p>自动追踪依赖并执行副作用：</p>
            <pre><code>const count = ref(0)

watchEffect(() => {
  console.log(\\x60count 现在是: \\x24{count.value}\\x60)
})

count.value++ // 输出: count 现在是: 1</code></pre>
            <h2>组合式函数（Composables）</h2>
            <p>组合式函数是利用组合式 API 封装和复用状态逻辑的函数：</p>
            <pre><code>import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const double = computed(() => count.value * 2)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue

  return { count, double, increment, decrement, reset }
}</code></pre>
            <h2>最佳实践</h2>
            <ul>
                <li>优先使用 ref 还是 reactive？根据数据结构选择</li>
                <li>使用 computed 处理派生状态</li>
                <li>通过组合式函数复用逻辑</li>
                <li>保持函数的单一职责</li>
            </ul>
        `,
    tags: ['Vue3', 'TypeScript'],
    category: '技术分享',
    views: 0,
    createdAt: '2026-05-06'
  },
  {
    title: 'TypeScript 入门指南',
    summary: 'TypeScript 是 JavaScript 的超集，提供了强大的类型系统、智能提示和编译时检查。',
    content: `
            <p>TypeScript 是 JavaScript 的超集，它添加了可选的静态类型和基于类的面向对象编程。</p>
            <h2>为什么使用 TypeScript？</h2>
            <ul>
                <li><strong>类型安全：</strong>编译时发现错误，减少运行时bug</li>
                <li><strong>智能提示：</strong>IDE 提供丰富的代码补全</li>
                <li><strong>更好的工具支持：</strong>重构、导航更加便捷</li>
                <li><strong>渐进式采用：</strong>可以逐步迁移现有项目</li>
            </ul>
            <h2>基础类型</h2>
            <p>TypeScript 支持多种基础类型：</p>
            <pre><code>// 字符串
const name: string = '张三'

// 数字
const age: number = 25

// 布尔值
const isActive: boolean = true

// 数组
const numbers: number[] = [1, 2, 3]
const names: Array&lt;string&gt; = ['张三', '李四']

// 元组
const person: [string, number] = ['张三', 25]</code></pre>
            <h2>接口（Interface）</h2>
            <p>接口用于定义对象的结构：</p>
            <pre><code>interface Person {
  name: string
  age: number
  email?: string  // 可选属性
  readonly id: number  // 只读属性
}

const user: Person = {
  name: '张三',
  age: 25,
  id: 1
}</code></pre>
            <h2>泛型（Generics）</h2>
            <p>泛型让我们编写可重用的组件：</p>
            <pre><code>function identity&lt;T&gt;(arg: T): T {
  return arg
}

const num = identity&lt;number&gt;(42)
const str = identity&lt;string&gt;('hello')</code></pre>
            <h2>类型推断</h2>
            <p>TypeScript 可以自动推断类型：</p>
            <pre><code>let message = 'hello'  // 自动推断为 string

function add(a: number, b: number) {
  return a + b  // 自动推断返回 number
}</code></pre>
        `,
    tags: ['TypeScript', 'JavaScript'],
    category: '技术分享',
    views: 0,
    createdAt: '2026-05-07'
  },
  {
    title: '使用 Vite 快速搭建项目',
    summary: 'Vite 是一个极快的开发服务器和构建工具，基于 ES Module 实现按需编译。',
    content: `
            <p>Vite 是新一代前端构建工具，由 Vue.js 作者尤雨溪开发，它彻底改变了前端项目的开发体验。</p>
            <h2>为什么选择 Vite？</h2>
            <p>传统构建工具如 Webpack 在开发时需要将所有代码打包，这导致启动时间慢、热更新延迟。Vite 采用了完全不同的方式：</p>
            <ul>
                <li><strong>原生 ES Module：</strong>利用浏览器原生支持的 ES Module，无需打包</li>
                <li><strong>按需编译：</strong>只编译当前页面需要的模块</li>
                <li><strong>极速 HMR：</strong>热模块替换，秒级更新</li>
                <li><strong>Rollup 构建：</strong>生产环境使用 Rollup，打包体积更小</li>
            </ul>
            <h2>快速开始</h2>
            <pre><code>npm create vite@6.5.0 . -- --template vue-ts</code></pre>
            <h2>核心配置</h2>
            <pre><code>import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})</code></pre>
            <h2>常用命令</h2>
            <pre><code>npm run dev
npm run build
npm run preview</code></pre>
        `,
    tags: ['Vite', 'Vue3'],
    category: '技术分享',
    views: 0,
    createdAt: '2026-05-06'
  },
  {
    title: 'Pinia 状态管理',
    summary: 'Pinia 是 Vue3 的新状态管理库，简单而强大。',
    content: `
            <p>Pinia 提供了直观且灵活的状态管理方案。</p>
            <h2>为什么选择 Pinia？</h2>
            <ul>
                <li>完整的 TypeScript 支持</li>
                <li>极轻的体积</li>
                <li>模块化设计</li>
            </ul>
            <h2>基本使用</h2>
            <p>Pinia 的 API 非常简单易用。</p>
            <h2>Composable 状态不共享问题</h2>
            <p>在 Home.vue 和 TagFilter.vue 中分别调用 composable 时，发现筛选功能不生效。</p>
            <p>每次调用 composable 都会创建新的状态实例，导致两个组件的状态不同步。</p>
            <h2>解决方案</h2>
            <p>让 composable 接收外部状态，而不是自己创建。</p>
            <h2>子组件无法更新父组件状态</h2>
            <p>TagFilter 组件中的 setTag 方法无法更新父组件的状态。</p>
            <p>使用 emit 事件向父组件发送消息。</p>
        `,
    tags: ['Pinia', 'Vue3'],
    category: '技术分享',
    views: 0,
    createdAt: '2026-05-08'
  },
  {
    title: '文章阅读量',
    summary: '文章阅读量统计功能。',
    content: `
            <p>文章阅读量统计功能的关键是使用 localStorage 来存储和检索阅读量。</p>
            <h2>文章阅读量统计的核心原理</h2>
            <div>
                用户访问文章详情页
                ↓
                onMounted() 触发
                ↓
                调用 blogStore.incrementViews(id)
                ↓
                article.views++
                ↓
                页面更新显示最新阅读量
            </div>
        `,
    tags: ['Vue3'],
    category: '项目经验',
    views: 0,
    createdAt: '2026-05-08'
  },
  {
    title: 'Vue3博客项目实战踩坑记',
    summary: '详细总结Vue3+TypeScript+Vite博客项目开发中遇到的实际问题及解决方案。',
    content: `
            <h2>1. Pinia状态管理与localStorage同步问题</h2>
            <p>store中的drafts.value和localStorage数据不同步，导致发布文章时找不到草稿。</p>
            <p><strong>解决方案</strong>：直接在store中更新数组，避免重新加载整个列表。</p>
            <pre><code>const saveDraft = (article) => {
    localStorage.setItem(\\x60draft_\\x24{draft.id}\\x60, JSON.stringify(draft))
    const existingIndex = drafts.value.findIndex(a => a.id === draft.id)
    if (existingIndex >= 0) {
        drafts.value[existingIndex] = draft
    } else {
        drafts.value.push(draft)
    }
}</code></pre>
            <h2>2. v-md-editor组件集成问题</h2>
            <p>组件注册、CSS加载、TypeScript类型等问题。</p>
            <p><strong>解决方案</strong>：正确配置main.ts，注意CSS文件路径。</p>
            <h2>3. 发布功能的双次调用问题</h2>
            <p>发布按钮会触发两次publishArticle调用。</p>
            <p><strong>解决方案</strong>：让父组件完全控制发布逻辑。</p>
            <h2>经验总结</h2>
            <ul>
                <li>状态管理要考虑数据一致性</li>
                <li>第三方组件集成要注意配置细节</li>
                <li>组件通信要避免重复调用</li>
                <li>用户体验要考虑性能优化</li>
            </ul>
        `,
    tags: ['Vue3', 'TypeScript', '项目经验', '踩坑记录'],
    category: '项目实战',
    views: 0,
    createdAt: '2026-05-22'
  }
];

const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'you520.zb',
    database: 'blog'
});

db.connect(err => {
    if (err) {
        console.error('数据库连接失败:', err);
        process.exit(1);
    }

    db.query('DELETE FROM articles', (err) => {
        if (err) {
            console.error('清空失败:', err);
            db.end();
            return;
        }
        console.log('已清空旧数据，开始导入...');

        let inserted = 0;
        articles.forEach((article) => {
            db.query(
                'INSERT INTO articles (title, content, summary, tags, category, views, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [article.title, article.content, article.summary, JSON.stringify(article.tags), article.category, article.views, 'published', article.createdAt],
                (err) => {
                    if (err) {
                        console.error('插入失败:', article.title, err.message);
                    } else {
                        console.log('  OK ' + article.title);
                    }
                    inserted++;
                    if (inserted === articles.length) {
                        console.log('导入完成！共 ' + articles.length + ' 篇文章');
                        db.end();
                    }
                }
            );
        });
    });
});
