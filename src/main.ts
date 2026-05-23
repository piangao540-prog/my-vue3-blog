import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router'
import './assets/styles/responsive.css'
import { createPinia } from 'pinia'
// 引入 Element Plus 组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
// 引入 v-md-editor - 修正导入路径
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'

// 引入主题 - 修正主题导入
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
// 修正 CSS 路径
import './../node_modules/@kangc/v-md-editor/lib/theme/style/github.css'



// 使用主题
VMdEditor.use(githubTheme)
VMdPreview.use(githubTheme)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(VMdEditor)
app.use(VMdPreview)
app.mount('#app')
