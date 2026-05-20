import type { Article } from '@/stores/blog'

// 文章列表信息
export const articleList: Article[] = [
    {
        id: 1,
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
        views: 0, // 初始阅读量
        createdAt: '2026-05-05',
        like: false,
        sumTag: '前端技术',
        tags: ['Vue3', 'Vite', 'Element Plus', 'TypeScript', 'Pinia', 'Echarts'],

    },
    {
        id: 2,
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
  console.log(\`count 从 \${oldVal} 变成了 \${newVal}\`)
})

count.value++ // 输出: count 从 0 变成了 1</code></pre>
            <h3>watchEffect</h3>
            <p>自动追踪依赖并执行副作用：</p>
            <pre><code>const count = ref(0)

watchEffect(() => {
  console.log(\`count 现在是: \${count.value}\`)
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
        views: 0,
        createdAt: '2026-05-06',
        like: false,
        sumTag: '组合式 API',
        tags: ['Vue3', 'TypeScript'],
    },
    {
        id: 3,
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
const names: Array<string> = ['张三', '李四']

// 元组
const person: [string, number] = ['张三', 25]

// 枚举
enum Color {
  Red,
  Green,
  Blue
}
const color: Color = Color.Green

// 任意类型
let anyValue: any = 'hello'
anyValue = 123

// 空类型
function logMessage(): void {
  console.log('Hello')
}</code></pre>
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
}

// 接口继承
interface Student extends Person {
  grade: string
}

const student: Student = {
  name: '李四',
  age: 20,
  id: 2,
  grade: '大三'
}</code></pre>
            <h2>类型别名（Type Alias）</h2>
            <p>类型别名可以为类型创建新名称：</p>
            <pre><code>type Point = {
  x: number
  y: number
}

type ID = string | number

function printId(id: ID) {
  console.log(id)
}</code></pre>
            <h2>泛型（Generics）</h2>
            <p>泛型让我们编写可重用的组件：</p>
            <pre><code>// 泛型函数
function identity<T>(arg: T): T {
  return arg
}

const num = identity<number>(42)
const str = identity<string>('hello')

// 泛型接口
interface Container<T> {
  value: T
  getValue(): T
}

// 泛型类
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T
}

const myGenericNumber = new GenericNumber<number>()
myGenericNumber.zeroValue = 0
myGenericNumber.add = (x, y) => x + y</code></pre>
            <h2>类型推断</h2>
            <p>TypeScript 可以自动推断类型：</p>
            <pre><code>// 变量类型推断
let message = 'hello'  // 自动推断为 string

// 函数返回值推断
function add(a: number, b: number) {
  return a + b  // 自动推断返回 number
}

// 上下文类型推断
const names = ['张三', '李四']
names.forEach(name => {
  console.log(name.toUpperCase())  // name 被推断为 string
})</code></pre>
            <h2>高级类型</h2>
            <p>TypeScript 提供了多种高级类型：</p>
            <pre><code>// 联合类型
type Status = 'loading' | 'success' | 'error'

// 交叉类型
type Admin = { permissions: string[] }
type User = { name: string }
type AdminUser = Admin & User

// 类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

// 条件类型
type NonNullable<T> = T extends null | undefined ? never : T</code></pre>
        `,
        views: 0,
        createdAt: '2026-05-07',
        like: false,
        sumTag: 'TypeScript',
        tags: ['TypeScript', 'JavaScript'],
    },
    {
        id: 4,
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
            <h3>创建新项目</h3>
            <pre><code># 使用 npm
npm create vite@6.5.0 . -- --template vue-ts

# 使用 yarn
yarn create vite@6.5.0 . --template vue-ts

# 使用 pnpm
pnpm create vite@6.5.0 . --template vue-ts</code></pre>
            <h3>支持的模板</h3>
            <pre><code># Vue
--template vue
--template vue-ts

# React
--template react
--template react-ts

# Angular
--template angular

# Svelte
--template svelte
--template svelte-ts

# Vanilla
--template vanilla
--template vanilla-ts</code></pre>
            <h2>项目结构</h2>
            <pre><code>my-vite-project/
├── src/
│   ├── main.ts          # 入口文件
│   ├── App.vue          # 根组件
│   └── style.css        # 全局样式
├── index.html           # HTML 入口
├── package.json         # 依赖配置
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── .gitignore           # Git 忽略文件</code></pre>
            <h2>核心配置</h2>
            <h3>vite.config.ts 基础配置</h3>
            <pre><code>import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 路径别名
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    // 开发服务器配置
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    // 构建配置
    outDir: 'dist',
    sourcemap: false
  }
})</code></pre>
            <h2>常用命令</h2>
            <pre><code># 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 检查类型
npm run typecheck</code></pre>
            <h2>插件系统</h2>
            <p>Vite 拥有丰富的插件生态：</p>
            <ul>
                <li><strong>@vitejs/plugin-vue：</strong>Vue 支持</li>
                <li><strong>@vitejs/plugin-vue-jsx：</strong>JSX 支持</li>
                <li><strong>@vitejs/plugin-react：</strong>React 支持</li>
                <li><strong>vite-plugin-pages：</strong>文件系统路由</li>
                <li><strong>vite-plugin-vue-layouts：</strong>布局系统</li>
                <li><strong>unplugin-auto-import：</strong>自动导入</li>
                <li><strong>unplugin-vue-components：</strong>组件自动注册</li>
            </ul>
            <h2>与 Webpack 的对比</h2>
            <table>
                <thead>
                    <tr>
                        <th>特性</th>
                        <th>Vite</th>
                        <th>Webpack</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>启动速度</td>
                        <td>极快（毫秒级）</td>
                        <td>较慢（秒级）</td>
                    </tr>
                    <tr>
                        <td>热更新</td>
                        <td>极速 HMR</td>
                        <td>较慢</td>
                    </tr>
                    <tr>
                        <td>配置复杂度</td>
                        <td>简单</td>
                        <td>复杂</td>
                    </tr>
                    <tr>
                        <td>生态系统</td>
                        <td>快速增长</td>
                        <td>成熟</td>
                    </tr>
                </tbody>
            </table>
            <h2>最佳实践</h2>
            <ul>
                <li>使用 TypeScript 提升代码质量</li>
                <li>配置路径别名方便模块导入</li>
                <li>使用 ESLint 和 Prettier 保持代码风格一致</li>
                <li>配置开发服务器代理解决跨域问题</li>
                <li>使用环境变量管理配置</li>
            </ul>
        `,
        views: 0,
        createdAt: '2026-05-06',
        like: false,
        sumTag: '前端框架',
        tags: ['Vite', 'Vue3'],
    },
    {
        id: 5,
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
                        <h2>使用案例：Composable 状态不共享</h2>
            <h3>问题描述</h3>
            <p>在 Home.vue 和 TagFilter.vue 中分别调用 composable 时，发现筛选功能不生效。点击标签后，文章列表没有变化。</p>
            <p>每次调用 composable 都会创建新的状态实例，导致两个组件的状态不同步：</p>
            <pre><code>// Home.vue 创建实例1
const { filterArticles } = userTagFilter()

// TagFilter.vue 创建实例2
const { selectedTag, setTag } = userTagFilter()

// 两个实例的 selectedTag 相互独立</code></pre>
            <h3>解决方案</h3>
            <p>让 composable 接收外部状态，而不是自己创建：</p>
            <pre><code>// composable 接收外部状态
export const useTagFilter = (selectedTag: { value: string }) => {
  const filteredArticles = computed(() => {
    if (!selectedTag.value) {
      return blogStore.latestArticles
    }
    return blogStore.getArticlesByTag(selectedTag.value)
  })
  return { filteredArticles }
}

// 父组件定义状态
const selectedTag = ref('')
const { filteredArticles } = useTagFilter(selectedTag)</code></pre>
            <h2>问题二：子组件无法更新父组件状态</h2>
            <h3>问题描述</h3>
            <p>TagFilter 组件中的 setTag 方法无法更新父组件的状态。</p>
            <h3>原因分析</h3>
            <p>子组件直接修改 props 是无效的，Vue 中数据流是单向的。</p>
            <h3>解决方案</h3>
            <p>使用 emit 事件向父组件发送消息：</p>
            <pre><code>// TagFilter.vue
const emit = defineEmits(['update:selectedTag'])

const setTag = (tag: string) => {
  emit('update:selectedTag', tag)
}

// Home.vue
&lt;TagFilter
  :selected-tag="selectedTag"
  @update:selected-tag="selectedTag = $event"
/&gt;</code></pre>
            <h2>问题三：筛选逻辑不生效</h2>
            <h3>问题描述</h3>
            <p>选择标签后，不包含该标签的文章仍然显示。</p>
            <h3>原因分析</h3>
            <p>筛选逻辑使用了错误的数据源或条件判断。</p>
            <h3>解决方案</h3>
            <p>确保使用 computed 属性正确筛选：</p>
            <pre><code>const filteredArticles = computed(() => {
  if (!selectedTag.value) {
    return blogStore.latestArticles
  }
  return blogStore.getArticlesByTag(selectedTag.value)
})</code></pre
        `,
        views: 0, // 初始阅读量
        createdAt: '2026-05-08',
        like: false,
        sumTag: '状态管理',
        tags: ['Pinia', 'Vue3'],
    },
    {
        id: 6,
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
                saveViews() → localStorage 保存
                    ↓
                页面更新显示最新阅读量
            </div>
            <h2>基本使用</h2>`,
        like: false,
        views: 0, // 初始阅读量
        createdAt: '2026-05-08',
        sumTag: '文章阅读量',
        tags: ['Vue3'],
    },
]