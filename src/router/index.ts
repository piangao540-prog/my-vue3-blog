import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: { title: '' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { title: '注册' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/views/ArticleList.vue'),
      meta: { title: '文章' },
    },
    {
      path: '/archive',
      name: 'archive',
      component: () => import('@/views/Archive.vue'),
      meta: { title: '归档' },
    },
    {
      path: '/articles/:id',
      name: 'article-detail',
      component: () => import('@/views/ArticleDetail.vue'),
      meta: { title: '文章' },
    },
    {
      path: '/interviews',
      name: 'interviews',
      component: () => import('@/views/InterviewList.vue'),
      meta: { title: '面经' },
    },
    // 必须排在 /interviews/:id 前面，否则 editor 会被当成 id
    {
      path: '/interviews/editor',
      name: 'interview-editor',
      component: () => import('@/views/InterviewEditorView.vue'),
      meta: { requiresAuth: true, role: 'admin', title: '写面经' },
    },
    {
      path: '/interviews/:id',
      name: 'interview-detail',
      component: () => import('@/views/InterviewDetail.vue'),
      meta: { title: '面经' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue'),
      meta: { title: '关于' },
    },
    {
      path: '/memory',
      name: 'memory',
      component: () => import('@/views/Memory.vue'),
      meta: { title: '记忆' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true, title: '个人中心' },
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('@/views/ArticleEditorView.vue'),
      meta: { requiresAuth: true, role: 'admin', title: '写文章' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/Admin.vue'),
      meta: { requiresAuth: true, role: 'admin', title: '后台管理' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
      meta: { title: '页面不存在' },
    },
  ],
})
// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 带上原目标地址，登录后才能跳回来
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  if (to.meta.role && userStore.userInfo?.role !== to.meta.role) {
    ElMessage.warning('只有管理员才能访问')
    next('/')
    return
  }
  next()
})

const DEFAULT_TITLE = 'PianGao 的博客'

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
})

export default router
