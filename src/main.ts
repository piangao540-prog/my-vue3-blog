import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router'
import './assets/styles/responsive.css'
import { createPinia } from 'pinia'
// 引入 Element Plus 组件库
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'
// 代码高亮主题
import 'highlight.js/styles/github.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
