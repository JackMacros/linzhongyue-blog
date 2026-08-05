---
name: linzhongyue-blog-publisher
description: Write, revise, upload images for, save drafts of, and publish Markdown articles to the Lin Zhongyue personal blog through its authenticated HTTP API. Use when an agent is asked to create or update a blog post, inspect available tags or columns, upload article images, schedule publication, or verify a published linzhongyue.cn article.
---

# Lin Zhongyue Blog Publisher

Create production-ready Markdown and send it to the blog with `scripts/blog_publisher.py`. Keep credentials only in environment variables.

## Required environment

Set these variables in the agent runtime:

- `LINZHONGYUE_BLOG_USERNAME`
- `LINZHONGYUE_BLOG_PASSWORD`
- `LINZHONGYUE_BLOG_BASE_URL` (optional; defaults to `https://linzhongyue.cn`)
- `LINZHONGYUE_BLOG_PUBLIC_URL` (optional; defaults to the base URL)

Never print, persist, commit, or place credentials in Markdown, commands, logs, or Skill files. Do not accept a password as a command-line argument.

## Workflow

1. Confirm the topic, intended audience, language, and whether the user explicitly wants a draft or publication. Default to Chinese and `DRAFT` when unspecified.
2. Inspect valid tag and column IDs before writing:

   ```bash
   python scripts/blog_publisher.py metadata
   ```

3. Draft a UTF-8 Markdown file. Use one `#` title at most, clear `##`/`###` headings, fenced code blocks with language identifiers, and descriptive image alt text. Do not include `iframe`, `div`, `script`, `style`, `object`, or `embed` HTML tags.
4. Upload local images before creating the article, then insert the returned URL:

   ```bash
   python scripts/blog_publisher.py upload-image --file ./diagram.png
   ```

5. Create a draft unless publication was explicit:

   ```bash
   python scripts/blog_publisher.py create \
     --title "文章标题" \
     --summary "不超过 1000 字的摘要" \
     --markdown-file ./article.md \
     --column-id 1 \
     --tag-id 2 --tag-id 5
   ```

6. Add `--publish` only when the user explicitly requested immediate or scheduled publication. For a schedule, also pass an Asia/Shanghai local time such as `--published-at 2026-08-06T09:00:00`.
7. Inspect the returned JSON. Report the article ID, status, slug, and public URL. For immediate publication, verify the returned `article_url` with an HTTP GET before claiming success. A future publication time intentionally returns 404 publicly until that time.

## Update and publish

Fetch an article before changing it:

```bash
python scripts/blog_publisher.py show --article-id 63
```

Update only the supplied fields; unspecified fields are preserved:

```bash
python scripts/blog_publisher.py update --article-id 63 --markdown-file ./revised.md
```

Publish an existing draft without rewriting its content:

```bash
python scripts/blog_publisher.py set-status --article-id 63 --status PUBLISHED
```

Use `DRAFT` to unpublish. Never delete an article through this Skill.

## Editorial and safety rules

- Do not invent personal experience, project results, citations, commands, or production claims. Mark uncertain facts for review.
- Preserve the author's existing voice and facts when revising an article.
- Prefer a useful summary, specific headings, runnable examples, and a concise conclusion over filler.
- Check for an exact-title match before creating. The script blocks duplicate titles unless `--allow-duplicate-title` is deliberately supplied.
- Never publish merely because a draft was created successfully. Publication must be explicit in the user request or a separate confirmed step.
- Treat returned cookies and image URLs as operational data; never expose session cookies.

Read [references/api.md](references/api.md) when troubleshooting requests, calling the API without the bundled script, or extending the Skill.
