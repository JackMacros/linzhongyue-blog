<div align="center">
  <img src="./frontend/public/site-icon.svg" width="88" alt="Lin Zhongyue Blog icon" />

  <h1>Lin Zhongyue Blog</h1>

  <p><strong>A modern full-stack blog for publishing, portfolio building, and personal storytelling</strong></p>
  <p>An open-source public site, administration console, and Spring Boot API in one repository.</p>

  <p>
    <a href="./README.md">简体中文</a> · <strong>English</strong>
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
    <a href="https://linzhongyue.cn"><strong>Live Demo</strong></a> ·
    <a href="https://admin.linzhongyue.cn">Admin Console</a> ·
    <a href="./frontend/README.md">Frontend Docs</a> ·
    <a href="./app/README.md">Admin Docs</a> ·
    <a href="./backend/README.md">Backend Docs</a>
  </p>
</div>

![Lin Zhongyue Blog home page](./docs/screenshots/home.png)

> A complete, independently deployable personal blog solution covering Markdown authoring, column organization, media management, site configuration, and traffic analytics.

## Overview

Lin Zhongyue Blog uses a decoupled frontend/backend architecture with three applications: a public blog, an administration console, and a monolithic API. Articles are stored as Markdown, while site profiles, tags, columns, projects, experience, skills, and media assets are maintained from the admin console.

The two frontend applications are built independently and hosted by Nginx. The backend provides content management, authentication, caching, analytics, and object-storage integration.

| Directory | Purpose | Stack | Local port |
|---|---|---|---:|
| [`frontend`](./frontend) | Public blog | React, TypeScript, Vite | 3000 |
| [`app`](./app) | Administration console | React, TypeScript, Vite | 3001 |
| [`backend`](./backend) | Monolithic API | Spring Boot, MySQL, Redis | 8080 |
| [`docs`](./docs) | Requirements, deployment examples, and articles | Markdown, Nginx | — |
| [`skills`](./skills) | Blog publishing Agent Skill | Python, Markdown | — |

## Highlights

- Markdown authoring, syntax highlighting, stable heading anchors, and a shared table of contents
- Tag and column management with priority-based column ordering
- Chinese and English UI with persisted language preferences
- Sa-Token administrator sessions and Redis content caching
- Qiniu Cloud uploads, article images, and a reusable media library
- Editable site profile, featured projects, experience, skills, and social links
- Daily PV/UV aggregation, article view counts, and administration audit logs
- MySQL Flyway migrations and a legacy article migration utility
- Independent frontend builds, Docker Compose backend deployment, and Nginx reverse proxying

## Screenshots

<table>
  <tr>
    <td width="50%" align="center">
      <strong>Blog</strong><br />
      <img src="./docs/screenshots/blog.png" alt="Blog article list" />
    </td>
    <td width="50%" align="center">
      <strong>Columns</strong><br />
      <img src="./docs/screenshots/columns.png" alt="Blog column list" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <strong>About</strong><br />
      <img src="./docs/screenshots/about.png" alt="About page" />
    </td>
    <td width="50%" align="center">
      <strong>Contact</strong><br />
      <img src="./docs/screenshots/contact.png" alt="Contact page" />
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <strong>Administration Console</strong><br />
      <img src="./docs/screenshots/admin-dashboard.png" alt="Administration dashboard" />
    </td>
  </tr>
</table>

## Technology Stack

| Layer | Main technologies |
|---|---|
| Public frontend | React 19, TypeScript 5.9, Vite 7, Tailwind CSS, React Router, React Markdown |
| Admin console | React 19, TypeScript 5.9, Vite 7, Radix UI, Recharts, React Hook Form |
| Backend API | Java 21, Spring Boot 3.5, MyBatis-Plus, Sa-Token, Flyway, Springdoc OpenAPI |
| Data and caching | MySQL 8, Redis 6+ |
| Image storage | Qiniu Cloud object storage |
| Deployment | Docker Compose, Nginx, Let's Encrypt |

## Quick Start

### Requirements

- Node.js 20+
- npm 10+
- JDK 21
- Maven 3.9+
- MySQL 8+
- Redis 6+

### 1. Configure the backend

Create a database named `linzhongyue_blog`, then copy the environment template and enter your local values:

```powershell
Copy-Item backend/.env.example backend/.env
```

At minimum, configure the database password, Redis password, and initial administrator password. `backend/.env` is ignored by Git and must never contain values intended for source control.

### 2. Start the backend

```powershell
cd backend
mvn spring-boot:run
```

Flyway creates the schema and sample site content on the first startup.

### 3. Start the public frontend

```powershell
cd frontend
npm ci
npm run dev
```

### 4. Start the admin console

```powershell
cd app
npm ci
npm run dev
```

| Service | URL |
|---|---|
| Public blog | `http://localhost:3000` |
| Admin console | `http://localhost:3001` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |

During development, both Vite servers proxy `/api` to `http://localhost:8080`.

## Build and Verify

```powershell
cd frontend
npm run build

cd ../app
npm run build

cd ../backend
mvn test
mvn package
```

See each subproject's `README.md` and `AGENTS.md` for detailed commands and contribution constraints.

## Deployment Overview

1. Build `frontend/dist` and `app/dist`.
2. Build `backend/target/linzhongyue-blog.jar`.
3. Configure environment variables securely on the server; never upload your local `.env`.
4. Host both static applications with Nginx and reverse proxy `/api/` to the backend.

See [`docs/nginx-blog.conf.example`](./docs/nginx-blog.conf.example) for a generic Nginx configuration and [`backend/README.md`](./backend/README.md) for Docker Compose deployment details.

## Agent Skill

The repository includes the [`linzhongyue-blog-publisher`](./skills/linzhongyue-blog-publisher) Skill. An agent can use it to authenticate against this system's API and create, save, update, or publish articles. Supply the site URL and administrator credentials through environment variables; never place tokens or passwords in the Skill, source code, or logs.

## Security

- Never commit `.env`, `backend/config/application.yml`, logs, database backups, certificates, private keys, or cloud credentials.
- `.env.example` and `application.example.yml` must contain placeholders only.
- If a secret has ever entered Git history, adding it to `.gitignore` is insufficient: rotate the secret and clean the history.

## Contributing

Issues and pull requests are welcome. Before submitting a change, read the `AGENTS.md` nearest to the files you modify and run the relevant build or test commands.

## License

This project is open source under the [MIT License](./LICENSE).

<div align="center">
  <sub>Built with code, curiosity, and a little moonlight.</sub>
</div>
