# 公开博客前台

林中月个人博客的公开访问端，使用 React、TypeScript、Vite 和 Tailwind CSS 构建。运行时通过 `/api/public/**` 获取文章和站点内容，构建产物是可由 Nginx 或其他静态服务器托管的 `dist` 目录。

## 功能

- 首页 Hero、精选项目和最新文章
- 博客列表、搜索、标签及专栏筛选
- Markdown 正文、代码高亮、目录和相关文章
- 专栏列表与详情页
- 关于、项目和联系页面
- 中英文界面及语言偏好持久化
- 平滑滚动、滚动渐入、3D 卡片和全局加载状态
- 每日 PV/UV 上报和文章浏览量统计

## 技术栈

- React 19、TypeScript 5、Vite 7
- React Router 7（`HashRouter`）
- Tailwind CSS 3、Radix UI
- GSAP、Lenis
- React Markdown、Remark GFM、Rehype Highlight

## 本地开发

要求 Node.js 20+ 和 npm 10+。先启动根目录下的 `backend`，再运行：

```powershell
npm ci
npm run dev
```

开发地址为 `http://localhost:3000`。Vite 会将 `/api` 代理到 `http://localhost:8080`，无需在前端保存后端地址或凭据。

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
├─ api/          # 请求封装、接口类型、站点内容上下文
├─ components/   # 通用组件和基础 UI
├─ pages/        # 首页、博客、文章、专栏、关于和联系
├─ sections/     # 导航、Hero 等页面区块
├─ hooks/        # 自定义 Hooks
├─ i18n.tsx      # 中英文 UI 文案和语言状态
├─ App.tsx       # 路由、全局滚动和访问统计
└─ main.tsx      # React 入口与 HashRouter
```

## 路由

项目使用 `HashRouter`，静态托管时无需为每个前端路由配置服务端回退：

| 路径 | 页面 |
|---|---|
| `#/` | 首页 |
| `#/blog` | 文章列表 |
| `#/blog/:slug` | 文章详情 |
| `#/columns` | 专栏列表 |
| `#/columns/:slug` | 专栏详情 |
| `#/about` | 关于与全部项目 |
| `#/contact` | 联系 |

## 数据与内容

- 文章、标签、专栏、项目、经历、技能、头像和联系方式来自后端 API。
- `i18n.tsx` 仅维护界面文案和 API 不可用时的少量回退内容。
- 文章正文只有一套，不按界面语言复制或翻译。
- 项目首页只展示后台排序靠前的 3 条，“关于”页面展示全部启用项目。

## Markdown 安全

前端不启用原始 HTML 渲染。后端同时拒绝 `iframe`、`div`、`script`、`style`、`object` 和 `embed` 等危险原始 HTML。修改 Markdown 管道时不得绕过这两层限制。

## 构建与部署

```powershell
npm run build
```

将生成的 `dist` 整体部署到静态服务器。项目的 `base` 为 `./`，资源路径可用于子目录或独立域名部署。不要提交 `dist`、`node_modules`、日志或本地配置。

协作规范见 [`AGENTS.md`](./AGENTS.md)。
