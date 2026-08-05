# 博客管理后台

林中月个人博客的管理端 SPA，负责文章、标签、专栏、图片素材、站点资料和管理员信息维护。应用使用 Sa-Token HttpOnly Cookie 登录，不在浏览器存储管理 Token。

## 功能

- 管理员登录、资料和密码修改
- 仪表盘、文章数量和访问趋势
- Markdown 文章创建、编辑、预览、发布和下架
- 编辑器图片上传、素材库、固定高度及双向同步滚动
- 标签和专栏维护，专栏排序
- 首页项目、经历、技能、社交链接和站点资料维护
- 七牛云图片素材管理
- 管理操作日志

## 技术栈

- React 19、TypeScript 5、Vite 7
- React Router 7（`HashRouter`）
- Tailwind CSS 3、Radix UI
- React Hook Form、Zod
- React Markdown、Remark GFM

## 本地开发

要求 Node.js 20+ 和 npm 10+。先启动根目录下的 `backend`，再运行：

```powershell
npm ci
npm run dev
```

管理端地址为 `http://localhost:3001`，Vite 将 `/api` 代理到 `http://localhost:8080`。

登录账号由后端环境变量初始化：

```text
BLOG_ADMIN_USERNAME
BLOG_ADMIN_PASSWORD
```

不要把真实账号密码写入本项目、README、截图或浏览器脚本。

## 可用命令

```powershell
npm run dev      # 启动开发服务器
npm run build    # TypeScript 检查并生成 dist
npm run lint     # ESLint 检查
npm run preview  # 预览生产构建
```

## 目录

```text
src/
├─ api/          # API 请求和共享类型
├─ auth/         # 登录状态与 AuthProvider
├─ components/   # 管理端组件和基础 UI
├─ layouts/      # 后台框架、导航和菜单
├─ pages/        # 登录、仪表盘、资料页
│  ├─ content/   # 文章、标签、专栏、站点和素材
│  └─ system/    # 操作日志
├─ App.tsx       # 路由和登录保护
└─ main.tsx      # React 入口
```

## 路由

| 路径 | 页面 |
|---|---|
| `#/login` | 登录 |
| `#/dashboard` | 仪表盘 |
| `#/content/posts` | 文章管理 |
| `#/content/posts/new` | 新建文章 |
| `#/content/posts/:id/edit` | 编辑文章 |
| `#/content/tags` | 标签管理 |
| `#/content/columns` | 专栏管理 |
| `#/content/site` | 站点内容 |
| `#/content/media` | 图片素材 |
| `#/system/logs/operation` | 操作日志 |
| `#/profile` | 管理员资料 |

## 登录与接口

- 所有请求使用同源 `/api`。
- 登录成功后后端设置 `blog-token` HttpOnly Cookie。
- `fetch` 必须保留 `credentials: 'include'`。
- HTTP 401 会触发统一的登录失效处理。
- 修改接口结构时同步更新 `src/api/types.ts` 和后端 DTO。

## 文章编辑约束

- 正文以 Markdown 存储。
- 禁止提交 `iframe`、`div`、`script`、`style`、`object`、`embed` 原始 HTML。
- 图片先通过素材接口上传七牛云，再写入 Markdown 或封面字段。
- 发布、下架和删除属于有状态操作，应保留确认或明确的用户操作边界。

## 构建与部署

```powershell
npm run build
```

将 `dist` 部署到受 HTTPS 保护的独立管理域名或路径，并确保后端 `BLOG_ALLOWED_ORIGINS` 包含管理端来源。生产环境必须启用安全 Cookie。不要提交 `dist`、`node_modules` 或任何凭据。

协作规范见 [`AGENTS.md`](./AGENTS.md)。
