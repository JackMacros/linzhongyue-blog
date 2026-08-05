# 数据库脚本

## 推荐方式：Flyway 自动初始化

正常开发和生产环境不需要手动导入 SQL。创建空数据库 `linzhongyue_blog`，配置 `backend/.env` 后启动后端，Flyway 会按顺序执行：

- `V1`：完整表结构
- `V2`：站点资料、专栏、项目和社交链接示例
- `V3`：经历与技能示例
- `V4`、`V5`：后续结构和内容升级

管理员表为空时，后端使用 `BLOG_ADMIN_USERNAME` 和 `BLOG_ADMIN_PASSWORD` 创建唯一管理员。

## 快速演示：完整 SQL 快照

[`linzhongyue_blog_demo.sql`](./linzhongyue_blog_demo.sql) 是独立的 MySQL 8 演示快照，包含：

- 当前完整表结构
- 示例站点资料、文章、标签、专栏、项目、经历和技能
- 示例访问统计
- BCrypt 加密的演示管理员

在仓库根目录执行：

```powershell
mysql --user=root --password --execute="source docs/sql/linzhongyue_blog_demo.sql"
```

将 `backend/.env` 中的数据库 URL 指向：

```text
jdbc:mysql://127.0.0.1:3306/linzhongyue_blog_demo?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false
```

因为该快照已经包含完整结构，使用它运行后端时需要禁用 Flyway：

```powershell
$env:SPRING_FLYWAY_ENABLED='false'
cd backend
mvn spring-boot:run
```

演示后台登录信息：

```text
用户名：admin
密码：admin123
```

该账号密码是公开信息，只能用于本地演示。请勿把演示数据库用于公网或生产环境；如需长期使用，请改用 Flyway 初始化并设置独立的强密码。

---

# Database Scripts

## Recommended: automatic Flyway initialization

Manual SQL import is unnecessary for normal development and production. Create an empty `linzhongyue_blog` database, configure `backend/.env`, and start the backend. Flyway applies the versioned schema and sample site data from `backend/src/main/resources/db/migration`.

When `admin_user` is empty, the backend creates the only administrator from `BLOG_ADMIN_USERNAME` and `BLOG_ADMIN_PASSWORD`.

## Quick demo: standalone SQL snapshot

[`linzhongyue_blog_demo.sql`](./linzhongyue_blog_demo.sql) is a standalone MySQL 8 snapshot containing the complete schema, sample content, visit statistics, and a BCrypt-protected demo administrator.

Run this command from the repository root:

```powershell
mysql --user=root --password --execute="source docs/sql/linzhongyue_blog_demo.sql"
```

Point `BLOG_DB_URL` in `backend/.env` to the `linzhongyue_blog_demo` database. Because the snapshot already contains the complete schema, disable Flyway when starting the backend:

```powershell
$env:SPRING_FLYWAY_ENABLED='false'
cd backend
mvn spring-boot:run
```

Demo admin credentials:

```text
Username: admin
Password: admin123
```

These credentials are public and intended only for local demonstration. Never use this database or password on an internet-facing or production deployment.
