# 个人博客

基于 Vue3 + Express + MySQL 的全栈博客。  
[在线体验](https://piangao-vue3-blog.vercel.app)

## 技术栈

- **前端**：Vue3 / TypeScript / Pinia / Element Plus / Vite
- **后端**：Node.js / Express
- **数据库**：MySQL 8.0（本地）/ TiDB Cloud（线上）
- **部署**：Vercel（前端 + Serverless API）

## 功能

文章编辑（Markdown + 代码高亮）、用户注册登录、评论收藏、搜索筛选、后台管理、暗色模式

## 本地运行

```bash
npm install
cd server && npm install
# 启动后端
cd server && node index.js
# 新终端启动前端
npm run dev
```

需本地 MySQL，配置见 `server/index.js`。

## 项目结构

```
api/          # Vercel 后端入口
server/       # Express API + 数据库
src/          # Vue3 前端（api / components / stores / views）
```
