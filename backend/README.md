# 博客后端 API

林中月个人博客的单体 Spring Boot API，为公开博客和管理后台提供文章、站点内容、认证、图片、统计与日志接口。

## 技术栈

- Java 21、Spring Boot 3.5
- Spring MVC、Validation、AOP、Spring Cache
- MyBatis-Plus、MySQL 8、Druid
- Flyway 数据库迁移
- Sa-Token、Redis
- 七牛云 Java SDK
- Springdoc OpenAPI

## 模块

```text
src/main/java/com/linzhongyue/blog/
├─ article/      # 文章、详情、浏览量和 Markdown 校验
├─ auth/         # 管理员登录、资料和密码
├─ column/       # 专栏
├─ tag/          # 标签
├─ site/         # 站点资料、项目、经历、技能和社交链接
├─ media/        # 七牛云图片和素材引用检查
├─ statistics/   # 每日 PV/UV
├─ dashboard/    # 管理端统计
├─ log/          # 管理操作日志
├─ migration/    # 旧库文章迁移
├─ config/       # 安全、缓存和应用配置
└─ common/       # 统一响应与异常处理
```

## 本地运行

### 环境要求

- JDK 21
- Maven 3.9+
- MySQL 8+
- Redis 6+

创建数据库 `linzhongyue_blog`，然后复制并填写配置：

```powershell
Copy-Item .env.example .env
mvn spring-boot:run
```

应用启动后：

- API：`http://localhost:8080`
- Swagger UI：`http://localhost:8080/swagger-ui.html`
- OpenAPI JSON：`http://localhost:8080/v3/api-docs`

Flyway 会自动创建数据库结构和示例站点内容。首次启动且管理员表为空时，需要通过 `BLOG_ADMIN_USERNAME` 和 `BLOG_ADMIN_PASSWORD` 创建唯一管理员。

## 数据库脚本与演示账号

版本化表结构和种子数据位于 [`src/main/resources/db/migration`](./src/main/resources/db/migration)，这是正常开发和生产环境的推荐初始化方式。

项目另外提供 [`docs/sql/linzhongyue_blog_demo.sql`](../docs/sql/linzhongyue_blog_demo.sql) 完整快照，方便快速查看表结构或导入本地演示数据库。快照包含示例内容和演示管理员：

```text
用户名：admin
密码：admin123
```

这是公开的本地演示账号，不得用于公网或生产环境。SQL 快照已包含完整结构，使用它时需要禁用 Flyway；详细步骤见 [`docs/sql/README.md`](../docs/sql/README.md)。

## 配置

真实配置只能放在环境变量或已忽略的 `.env` 中。

| 变量 | 必填 | 说明 |
|---|---|---|
| `BLOG_DB_URL` | 是 | MySQL JDBC URL |
| `BLOG_DB_USERNAME` | 是 | 数据库账号 |
| `BLOG_DB_PASSWORD` | 是 | 数据库密码 |
| `BLOG_REDIS_HOST` | 是 | Redis 地址 |
| `BLOG_REDIS_PORT` | 否 | 默认 6379 |
| `BLOG_REDIS_PASSWORD` | 按环境 | Redis 密码 |
| `BLOG_REDIS_DATABASE` | 否 | Redis 数据库编号 |
| `BLOG_ADMIN_USERNAME` | 首次启动 | 唯一管理员用户名 |
| `BLOG_ADMIN_PASSWORD` | 首次启动 | 唯一管理员初始密码 |
| `BLOG_AUTH_COOKIE_SECURE` | 生产必填 | HTTPS 下设为 `true` |
| `BLOG_ALLOWED_ORIGINS` | 是 | 允许的博客和管理端 Origin，逗号分隔 |
| `BLOG_QINIU_ACCESS_KEY` | 使用图片时 | 七牛 AccessKey |
| `BLOG_QINIU_SECRET_KEY` | 使用图片时 | 七牛 SecretKey |
| `BLOG_QINIU_BUCKET` | 使用图片时 | 七牛 Bucket |
| `BLOG_QINIU_DOMAIN` | 使用图片时 | 七牛公开域名 |

旧库迁移变量只应临时启用，详见下文和 [`.env.example`](./.env.example)。

## 构建与测试

```powershell
mvn test
mvn clean package
java -jar target/linzhongyue-blog.jar
```

测试配置使用 H2 和不可用的测试 Redis 端口，覆盖 Spring 上下文、公开 API、未登录拦截、Redis 故障回源、登录限流、Markdown HTML 拒绝及数据库结构。不要在指向生产资源的 `.env` 环境下运行测试。

## Docker Compose

Compose 使用外置 JAR、配置文件和 `.env`：

```powershell
mvn clean package
New-Item -ItemType Directory -Force app
Copy-Item target/linzhongyue-blog.jar app/app.jar
Copy-Item config/application.example.yml config/application.yml
Copy-Item .env.example .env
# 编辑 .env 后再启动
docker compose up -d
```

默认映射宿主机 `10010` 到容器 `8080`。`app/app.jar`、`config/application.yml`、`.env` 和日志均被 Git 忽略。

## API 约定

所有 JSON API 使用统一响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

- `/api/public/**` 为公开接口。
- `/api/admin/**` 需要 Sa-Token 登录。
- 登录状态保存在名为 `blog-token` 的 HttpOnly Cookie 中。
- 管理写接口会检查请求 Origin。
- 参数错误、未登录、数据服务异常均由统一异常处理转换为安全响应。

## 文章与 Markdown

- 正文以 Markdown 存储，Slug 由后端生成。
- 支持草稿、立即发布和未来时间发布。
- 一篇文章最多 20 个标签，专栏可为空。
- 后端拒绝 `iframe`、`div`、`script`、`style`、`object` 和 `embed` 原始 HTML。
- 发布、更新、下架文章时会清理文章、标签、专栏和仪表盘相关缓存。

## 旧库迁移

迁移器只读取旧库，仅迁移已发布且未逻辑删除的文章，并保留 Markdown、摘要、发布时间、浏览量、标签、专栏和图片地址。

迁移前备份新库并临时配置：

```text
BLOG_LEGACY_MIGRATION_ENABLED=true
BLOG_LEGACY_DB_URL=jdbc:mysql://legacy-db.example:3306/legacy_blog
BLOG_LEGACY_DB_USERNAME=read_only_user
BLOG_LEGACY_DB_PASSWORD=<read-only-password>
```

迁移完成后立即恢复 `BLOG_LEGACY_MIGRATION_ENABLED=false` 并移除旧库凭据。报告写入已忽略的 `migration-reports/`。

## 安全

- 不提交 `.env`、`config/application.yml`、日志、迁移报告或云服务密钥。
- 生产环境启用 HTTPS 和安全 Cookie，并设置精确的允许来源。
- Redis 是管理会话依赖；公开内容缓存故障时会回源 MySQL。
- 图片仅允许 JPEG、PNG、WebP、GIF，最大 10 MB。
- 不在异常响应或日志中输出密码、Token、Cookie、AccessKey 或 SecretKey。

协作规范见 [`AGENTS.md`](./AGENTS.md)。
