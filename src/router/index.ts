import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/articles',
    name: 'articles',
    component: () => import('@/views/ArticleList.vue')
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('@/views/Archive.vue')
  },
  {
    path: '/articles/:id',
    name: 'article-detail',
    component: () => import('@/views/ArticleDetail.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/About.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true}
  },
  {
    path: '/editor',
    name: 'editor',
    component: () => import('@/views/ArticleEditorView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true, role: 'admin'}
  }]
})
// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  if(to.meta.role && userStore.userInfo?.role !== to.meta.role){
    ElMessage.warning('只有管理员才能访问')
    next('/')
    return
  }
  next()
})

export default router
