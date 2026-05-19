import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
// 引入 Element Plus 组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入Markdown编辑器样式
import 'v-md-editor/lib/style/base-editor.css'
import 'v-md-editor/lib/theme/style/github.css'
// 引入编辑器
import VMdEditor from '@kangc/v-md-editor'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
// 注册github主题
VMdEditor.use(githubTheme)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(VMdEditor)
app.mount('#app')
