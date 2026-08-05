# Lin Zhongyue Blog Authoring API

## Contents

- [Connection and authentication](#connection-and-authentication)
- [Response envelope](#response-envelope)
- [Article model](#article-model)
- [Endpoints](#endpoints)
- [Publication semantics](#publication-semantics)
- [Validation and errors](#validation-and-errors)
- [Direct curl flow](#direct-curl-flow)

## Connection and authentication

- Production base URL: `https://linzhongyue.cn`
- Content type for JSON requests: `application/json`
- Login: `POST /api/auth/login`
- Authentication: Sa-Token session in the HttpOnly cookie named `blog-token`
- Cookie lifetime: controlled by the server. Re-login after HTTP `401`.
- Non-browser clients should omit the `Origin` header. Browser origins must be in the server allowlist.

Login body:

```json
{
  "username": "<from secure environment>",
  "password": "<from secure environment>"
}
```

Use an in-memory cookie jar when possible. If a cookie file is unavoidable, restrict its permissions and delete it when the operation ends.

## Response envelope

Every endpoint returns:

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

Success requires both an HTTP 2xx status and `code: 0`. On failure, `data` is `null` and `message` contains the safe error description.

## Article model

Create and replace-update requests use this body:

```json
{
  "title": "Required, 1-255 characters",
  "summary": "Optional, maximum 1000 characters",
  "coverUrl": "Optional, maximum 1000 characters",
  "content": "Required Markdown",
  "columnId": 1,
  "tagIds": [2, 5],
  "status": "DRAFT",
  "publishedAt": null
}
```

Rules:

- `status` is exactly `DRAFT` or `PUBLISHED`.
- `columnId` may be `null`, but a non-null ID must exist.
- `tagIds` may be empty and may contain at most 20 existing IDs.
- `publishedAt` is a local ISO date-time without an offset, interpreted in `Asia/Shanghai`, for example `2026-08-06T09:00:00`.
- Raw HTML tags `iframe`, `div`, `script`, `style`, `object`, and `embed` are rejected, including closing tags and case variations.
- The server generates an immutable-style slug such as `article-dcb8343810684a61`; clients do not submit slugs.
- PUT is a full article replacement. Fetch the current article first when only changing some fields.

The returned article detail includes `id`, `slug`, `title`, `summary`, `coverUrl`, `content`, `status`, `column`, `tags`, `publishedAt`, `viewCount`, `readMinutes`, `createdAt`, `updatedAt`, and `related`.

## Endpoints

### Authentication

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Create an authenticated session and set `blog-token` |
| GET | `/api/auth/me` | Verify the current session |
| POST | `/api/auth/logout` | Invalidate the current session |

### Article authoring

| Method | Path | Body/query | Purpose |
|---|---|---|---|
| GET | `/api/admin/articles` | `page`, `pageSize` (max 100), `keyword`, `status`, `columnId`, `tagId` | Search articles |
| GET | `/api/admin/articles/{id}` | — | Read full article |
| POST | `/api/admin/articles` | Article body | Create article |
| PUT | `/api/admin/articles/{id}` | Complete article body | Replace article |
| PATCH | `/api/admin/articles/{id}/status` | `{"status":"PUBLISHED","publishedAt":null}` | Publish or unpublish |

The API also supports `DELETE /api/admin/articles/{id}`, but this Skill intentionally does not expose deletion.

### Metadata

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/tags` | List every tag, including tags not used by published articles |
| GET | `/api/admin/columns` | List every column |

Use IDs from these responses. Do not guess IDs from display names.

### Images

`POST /api/admin/media/images` accepts `multipart/form-data` with one part named `file`. Supported site formats are JPEG, PNG, WebP, and GIF; the server rejects files larger than 10 MB. The returned media object contains the Qiniu URL to use in `coverUrl` or Markdown.

## Publication semantics

- Creating with `DRAFT` keeps the article private.
- Creating or changing status to `PUBLISHED` with `publishedAt: null` publishes at the server's current time.
- A future `publishedAt` schedules visibility. The database status is `PUBLISHED`, but public list and detail endpoints hide it until the timestamp.
- Changing a published article to `DRAFT` removes it from public endpoints but preserves its stored `publishedAt` value.
- Public article URL: `https://linzhongyue.cn/blog/{slug}`.
- Public verification endpoint: `GET /api/public/articles/{slug}`.

## Validation and errors

Common responses:

| HTTP | API code | Meaning |
|---|---:|---|
| 400 | `40000` | Invalid field, missing tag/column, or forbidden HTML |
| 400 | `40001` | Image exceeds 10 MB |
| 401 | `40100` | Session missing or expired; log in again |
| 403 | `40300` | Origin is not allowed |
| 404 | varies | Article or related entity does not exist |
| 503 | `50301` | Data service temporarily unavailable |

Do not retry validation, authentication, or authorization failures unchanged. For uncertain network failures after POST, search by exact title before retrying to avoid duplicate articles.

## Direct curl flow

Prefer `scripts/blog_publisher.py`. For manual diagnosis, keep credentials in environment variables and cookies in a temporary file:

```bash
cookie_file="$(mktemp)"
chmod 600 "$cookie_file"

curl --fail-with-body --silent --show-error \
  -c "$cookie_file" \
  -H 'Content-Type: application/json' \
  --data "{\"username\":\"$LINZHONGYUE_BLOG_USERNAME\",\"password\":\"$LINZHONGYUE_BLOG_PASSWORD\"}" \
  'https://linzhongyue.cn/api/auth/login'

curl --fail-with-body --silent --show-error \
  -b "$cookie_file" \
  'https://linzhongyue.cn/api/admin/tags'

rm -f "$cookie_file"
```

Avoid shell tracing (`set -x`) because it may reveal the login body.
