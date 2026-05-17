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
        summary: '深入了解 Vue3 的组合式 API，包括 ref、reactive、computed 等核心概念。',
        content: `
            <p>Vue3 引入了组合式 API，这是一个强大的新特性。</p>
            <h2>为什么需要组合式 API？</h2>
            <p>组合式 API 提供了更好的逻辑复用和代码组织方式。</p> 
            <h2>核心概念</h2>
            <h3>ref 和 reactive</h3>
            <p>ref 用于基本类型数据，reactive 用于对象类型数据。</p>
            <h3>computed</h3>
            <p>计算属性用于处理复杂的逻辑计算。</p>
            <h3>watch</h3>
            <p>监听数据变化并执行相应的操作。</p>
        `,
        views: 0, // 初始阅读量
        createdAt: '2026-05-06',
        like: false,
        sumTag: '组合式 API',
        tags: ['Vue3', 'TypeScript'],
    },
    {
        id: 3,
        title: 'TypeScript 入门指南',
        summary: 'TypeScript 是 JavaScript 的超集，提供了强大的类型系统。',
        content: `
            <p>TypeScript 让我们的代码更加健壮和可维护。</p>
            <h2>基础类型</h2>
            <p>TypeScript 支持多种基础类型：string、number、boolean、array 等。</p>
            <h2>接口</h2> 
            <p>接口用于定义对象的结构，提供更好的类型检查。</p>
            <h2>泛型</h2>
            <p>泛型让我们编写可重用的组件，支持多种类型。</p>
        `,
        views: 0, // 初始阅读量
        createdAt: '2026-05-07',
        like: false,
        sumTag: 'TypeScript',
        tags: ['TypeScript', 'JavaScript'],
    },
    {
        id: 4,
        title: '使用 Vite 快速搭建项目',
        summary: 'Vite 是一个极快的开发服务器和构建工具。',
        content: `
            <p>Vite 改变了前端项目的开发体验。</p>
            <h2>快速开始</h2>
            <pre><code>npm create vite@latest my-project -- --template vue-ts</code></pre>
            <h2>主要特点</h2>
            <ul>
                <li>极速的热更新</li>
                <li>按需编译</li>
                <li>简单的配置</li>
            </ul>
        `,
        views: 0, // 初始阅读量
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