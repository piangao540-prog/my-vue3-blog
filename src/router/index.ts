import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/articles',
    name: 'articles',
    component: () => import('@/views/ArticleList.vue')
  },
  {
    path: '/artcles/:id',
    name: 'artcle-detail',
    component: () => import('@/views/ArticleDetail.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/About.vue')
  }]
})

export default router