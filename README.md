<div align="center">
  <img src="./frontend/public/site-icon.svg" width="88" alt="林中月个人博客图标" />

  <h1>林中月个人博客</h1>

  <p><strong>一个面向内容创作与个人展示的现代化全栈博客系统</strong></p>
  <p>公开博客、管理后台与 Spring Boot API 一体化开源实现。</p>

  <p>
    <strong>简体中文</strong> · <a href="./README_EN.md">English</a>
  </p>

  <p>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
    <img src="https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot 3.5" />
    <img src="https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white" alt="Java 21" />
    <a href="https://github.com/JackMacros/linzhongyue-blog/commits/main"><img src="https://img.shields.io/github/last-commit/JackMacros/linzhongyue-blog?color=64d7c7" alt="Last commit" /></a>
  </p>

  <p>
    <a href="https://linzhongyue.cn"><strong>在线演示</strong></a> ·
    <a href="https://admin.linzhongyue.cn">管理后台</a> ·
    <a href="./frontend/README.md">前台文档</a> ·
    <a href="./app/README.md">后台文档</a> ·
    <a href="./backend/README.md">后端文档</a>
  </p>
</div>

![林中月个人博客首页](./docs/screenshots/home.png)

> 从 Markdown 内容创作、专栏组织和素材管理，到访问统计与站点配置，提供一套完整、可独立部署的个人博客解决方案。

## 项目简介

林中月个人博客采用前后端分离架构，由公开博客、管理后台和单体 API 三部分组成。文章以 Markdown 存储，站点资料、标签、专栏、项目、经历、技能和图片素材均可通过管理后台维护。

两个前端项目独立构建并由 Nginx 托管，后端负责内容管理、身份认证、缓存、统计和对象存储集成。

| 目录 | 说明 | 技术栈 | 本地端口 |
|---|---|---|---:|
| [`frontend`](./frontend) | 公开博客 | React、TypeScript、Vite | 3000 |
| [`app`](./app) | 管理后台 | React、TypeScript、Vite | 3001 |
| [`backend`](./backend) | 单体 API | Spring Boot、MySQL、Redis | 8080 |
| [`docs`](./docs) | 需求设计、部署示例与技术文章 | Markdown、Nginx | — |
| [`skills`](./skills) | 博客文章发布 Agent Skill | Python、Markdown | — |

## 功能亮点

- Markdown 文章编辑、代码高亮、稳定标题锚点与文章目录
- 标签与专栏管理，专栏支持优先级排序
- 中英文界面与浏览器语言状态持久化
- Sa-Token 管理员会话与 Redis 内容缓存
- 七牛云图片上传、文章插图和素材库
- 站点资料、精选项目、个人经历、技能及社交链接管理
- 每日 PV/UV 聚合、文章浏览量和管理操作日志
- MySQL Flyway 数据库迁移与旧博客文章迁移工具
- 独立前后台构建、Docker Compose 后端部署与 Nginx 反向代理

## 界面展示

<table>
  <tr>
    <td width="50%" align="center">
      <strong>博客</strong><br />
      <img src="./docs/screenshots/blog.png" alt="博客文章列表" />
    </td>
    <td width="50%" align="center">
      <strong>专栏</strong><br />
      <img src="./docs/screenshots/columns.png" alt="博客专栏列表" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <strong>关于我</strong><br />
      <img src="./docs/screenshots/about.png" alt="关于我页面" />
    </td>
    <td width="50%" align="center">
      <strong>联系我</strong><br />
      <img src="./docs/screenshots/contact.png" alt="联系我页面" />
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <strong>博客管理后台</strong><br />
      <img src="./docs/screenshots/admin-dashboard.png" alt="博客管理后台仪表盘" />
    </td>
  </tr>
</table>

## 技术栈

| 层级 | 主要技术 |
|---|---|
| 公开前台 | React 19、TypeScript 5.9、Vite 7、Tailwind CSS、React Router、React Markdown |
| 管理后台 | React 19、TypeScript 5.9、Vite 7、Radix UI、Recharts、React Hook Form |
| 后端 API | Java 21、Spring Boot 3.5、MyBatis-Plus、Sa-Token、Flyway、Springdoc OpenAPI |
| 数据与缓存 | MySQL 8、Redis 6+ |
| 图片存储 | 七牛云对象存储 |
| 部署 | Docker Compose、Nginx、Let's Encrypt |

## 快速开始

### 环境要求

- Node.js 20+
- npm 10+
- JDK 21
- Maven 3.9+
- MySQL 8+
- Redis 6+

### 1. 配置后端

创建数据库 `linzhongyue_blog`，复制环境变量示例并填写本地配置：

```powershell
Copy-Item backend/.env.example backend/.env
```

至少需要配置数据库密码、Redis 密码和首次启动的管理员密码。`backend/.env` 已被 Git 忽略，请勿提交真实凭据。

### 2. 启动后端

```powershell
cd backend
mvn spring-boot:run
```

Flyway 会在首次启动时自动创建数据库结构和示例站点内容。

### 3. 启动公开前台

```powershell
cd frontend
npm ci
npm run dev
```

### 4. 启动管理后台

```powershell
cd app
npm ci
npm run dev
```

| 服务 | 地址 |
|---|---|
| 公开博客 | `http://localhost:3000` |
| 管理后台 | `http://localhost:3001` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |

开发环境中，两个 Vite 服务都会把 `/api` 代理到 `http://localhost:8080`。

## 构建与检查

```powershell
cd frontend
npm run build

cd ../app
npm run build

cd ../backend
mvn test
mvn package
```

各子项目的详细命令和协作约束见对应的 `README.md` 与 `AGENTS.md`。

## 部署概览

1. 构建 `frontend/dist` 和 `app/dist`。
2. 构建 `backend/target/linzhongyue-blog.jar`。
3. 在服务器安全配置环境变量，不上传本地 `.env`。
4. 使用 Nginx 托管两个静态站点，并将 `/api/` 反向代理到后端。

通用 Nginx 示例见 [`docs/nginx-blog.conf.example`](./docs/nginx-blog.conf.example)，Docker Compose 部署说明见 [`backend/README.md`](./backend/README.md)。

## Agent Skill

仓库包含 [`linzhongyue-blog-publisher`](./skills/linzhongyue-blog-publisher) Skill，可供 Agent 按系统 API 完成登录、文章编写、草稿保存、更新和发布。使用前请通过环境变量提供站点地址与管理员凭据，不要把 Token 或密码写入 Skill、源码或日志。

## 安全说明

- 不要提交 `.env`、`backend/config/application.yml`、日志、数据库备份、证书、私钥或云服务凭据。
- `.env.example` 和 `application.example.yml` 只能包含占位值。
- 如果秘密曾进入 Git 历史，仅添加 `.gitignore` 不够；必须轮换秘密并清理历史。

## 贡献

欢迎通过 Issue 提交建议或通过 Pull Request 贡献改进。提交前请阅读对应目录下的 `AGENTS.md`，并完成受影响项目的构建或测试。

## 开源许可

本项目基于 [MIT License](./LICENSE) 开源。

<div align="center">
  <sub>Built with code, curiosity, and a little moonlight.</sub>
</div>
