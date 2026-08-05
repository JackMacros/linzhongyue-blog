# Backend agent guide

## Architecture

- Target Java 21 and preserve the single-module Spring Boot architecture.
- Organize code by domain package. Keep controllers thin, business rules in services, persistence in MyBatis-Plus mappers, and transport models in `dto` packages.
- Return all JSON through `ApiResponse<T>` and use `PageResponse<T>` for pagination.
- Use `BusinessException` for expected domain errors and let `GlobalExceptionHandler` sanitize responses.
- Prefer constructor injection. Do not add field injection or static service access.

## Database

- Treat applied Flyway migrations as immutable. Add a new versioned migration for every schema or seed change.
- Keep MySQL and H2 test compatibility in mind; add or update `schema-test.sql` when tests do not run Flyway.
- Wrap multi-table writes in `@Transactional`.
- Avoid unbounded queries and string-built SQL. Validate pagination limits and identifiers.
- Preserve article/tag relation integrity and media reference checks.

## Authentication and security

- Protect `/api/admin/**` with Sa-Token and keep the token in an HttpOnly Cookie.
- Preserve Origin validation for authentication and admin writes.
- Never log credentials, cookies, authorization values, database URLs containing secrets, Qiniu keys, or request bodies that may contain them.
- Read secrets only from environment-backed configuration. Do not add literal production defaults.
- Keep Markdown raw HTML rejection and image type/size validation intact.
- Do not weaken `Secure`, `SameSite`, CORS, or forwarded-header behavior without documenting the deployment impact.

## Caching and consistency

- Sa-Token sessions require Redis; public content caches should continue to fall back to MySQL when Redis is unavailable.
- Add appropriate `@CacheEvict` entries for mutations that affect articles, tags, columns, site content, statistics, or dashboard data.
- Preserve atomic article view and visit-statistic updates.

## API changes

- Validate request DTOs with Jakarta Validation and return safe, localized messages.
- Keep status strings and JSON field names compatible with both React clients.
- Update OpenAPI-visible DTOs, both frontend type files, READMEs, and tests when changing a contract.
- Do not expose entity objects when a dedicated public/admin DTO is required for safety or compatibility.

## Verification

From this directory, run:

```text
mvn test
mvn clean package
```

For schema changes, verify a clean database migration and an upgrade from the previous migration version. Do not edit `target`, local `.env`, `config/application.yml`, or generated logs.
