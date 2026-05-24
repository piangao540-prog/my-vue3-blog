# vue3 个人博客

一个基于Vue3 + TypeScript 的个人博客，用于前端面试作品展示。


## 技术栈

前端：
- vue 3 (Composition API + '<script setup>')
- TypeScript
- Pinia (状态管理)
- Vue Router
- Element Plus (UI 组件库)
- Vite (构建工具)
- ECharts (数据可视化)

工程化：
- GitHub Action CI 自动部署


## 功能特性

- 文章编辑器 — Markdown 编辑 + 实时预览
- 文章管理 — 草稿/发布/分类/标签/全文搜索
- 权限控制 — 普通用户和管理员角色区分
- 后台管理 — 文章列表管理、编辑、删除
- 深色主题 — 一键切换暗色模式
- 数据统计 — 阅读量、收藏、字数统计
- 用户系统 — 注册、登录、个人信息管理


## 本地运行


# 安装依赖

nem install


# 启动开发服务器

npm run dev

访问 `http://localhost:5173`


## 生产构建

npm run build
npm run preview


## 部署地址

- Vercel（国外）：[piangao-vue3-blog.vercel.app](https://piangao-vue3-blog.vercel.app)
- Cloudflare Pages（国内）：[my-vue3-blog.pages.dev](https://my-vue3-blog.431858074.workers.dev/)
