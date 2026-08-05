#!/usr/bin/env python3
"""Authenticated CLI for drafting and publishing Lin Zhongyue blog articles."""

from __future__ import annotations

import argparse
import http.cookiejar
import json
import mimetypes
import os
import sys
import uuid
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import HTTPCookieProcessor, Request, build_opener


class PublisherError(RuntimeError):
    """A safe, user-facing publishing failure."""


class BlogClient:
    def __init__(self) -> None:
        self.base_url = os.getenv("LINZHONGYUE_BLOG_BASE_URL", "https://linzhongyue.cn").rstrip("/")
        self.public_url = os.getenv("LINZHONGYUE_BLOG_PUBLIC_URL", self.base_url).rstrip("/")
        parsed = urlparse(self.base_url)
        if parsed.scheme != "https" and parsed.hostname not in {"localhost", "127.0.0.1"}:
            raise PublisherError("The API base URL must use HTTPS (except localhost).")
        self.username = os.getenv("LINZHONGYUE_BLOG_USERNAME")
        self.password = os.getenv("LINZHONGYUE_BLOG_PASSWORD")
        if not self.username or not self.password:
            raise PublisherError(
                "Set LINZHONGYUE_BLOG_USERNAME and LINZHONGYUE_BLOG_PASSWORD in the secure runtime environment."
            )
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = build_opener(HTTPCookieProcessor(self.cookie_jar))

    def login(self) -> None:
        self.request(
            "POST",
            "/api/auth/login",
            payload={"username": self.username, "password": self.password},
            authenticated=False,
        )

    def request(
        self,
        method: str,
        path: str,
        *,
        payload: dict[str, Any] | None = None,
        data: bytes | None = None,
        content_type: str | None = None,
        authenticated: bool = True,
    ) -> Any:
        if authenticated and not any(cookie.name == "blog-token" for cookie in self.cookie_jar):
            self.login()
        body = data
        headers = {"Accept": "application/json", "User-Agent": "linzhongyue-blog-publisher/1.0"}
        if payload is not None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            headers["Content-Type"] = "application/json; charset=utf-8"
        elif content_type:
            headers["Content-Type"] = content_type
        request = Request(f"{self.base_url}{path}", data=body, headers=headers, method=method)
        try:
            with self.opener.open(request, timeout=30) as response:
                raw = response.read().decode("utf-8")
        except HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="replace")
            try:
                message = json.loads(raw).get("message", raw)
            except json.JSONDecodeError:
                message = raw or exc.reason
            raise PublisherError(f"HTTP {exc.code}: {message}") from None
        except URLError as exc:
            raise PublisherError(f"Network request failed: {exc.reason}") from None

        try:
            envelope = json.loads(raw)
        except json.JSONDecodeError:
            raise PublisherError("The server returned a non-JSON response.") from None
        if envelope.get("code") != 0:
            raise PublisherError(f"API {envelope.get('code')}: {envelope.get('message', 'unknown error')}")
        return envelope.get("data")

    def get(self, path: str, query: dict[str, Any] | None = None) -> Any:
        if query:
            clean_query = {key: value for key, value in query.items() if value is not None}
            path = f"{path}?{urlencode(clean_query)}"
        return self.request("GET", path)

    def upload(self, file_path: Path) -> Any:
        if not file_path.is_file():
            raise PublisherError(f"Image not found: {file_path}")
        if file_path.stat().st_size > 10 * 1024 * 1024:
            raise PublisherError("Image exceeds the 10 MB server limit.")
        boundary = f"----linzhongyue-{uuid.uuid4().hex}"
        mime = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        if mime not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
            raise PublisherError("Image must be JPEG, PNG, WebP, or GIF.")
        body = bytearray()
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(
            f'Content-Disposition: form-data; name="file"; filename="{file_path.name}"\r\n'.encode("utf-8")
        )
        body.extend(f"Content-Type: {mime}\r\n\r\n".encode())
        body.extend(file_path.read_bytes())
        body.extend(f"\r\n--{boundary}--\r\n".encode())
        return self.request(
            "POST",
            "/api/admin/media/images",
            data=bytes(body),
            content_type=f"multipart/form-data; boundary={boundary}",
        )


def read_markdown(path_value: str) -> str:
    path = Path(path_value)
    if not path.is_file():
        raise PublisherError(f"Markdown file not found: {path}")
    content = path.read_text(encoding="utf-8")
    if not content.strip():
        raise PublisherError("Markdown content cannot be empty.")
    return content


def article_payload(args: argparse.Namespace, existing: dict[str, Any] | None = None) -> dict[str, Any]:
    old = existing or {}
    tags = old.get("tags") or []
    column = old.get("column")
    status = old.get("status", "DRAFT")
    if getattr(args, "publish", False):
        status = "PUBLISHED"
    if getattr(args, "draft", False):
        status = "DRAFT"
    markdown_file = getattr(args, "markdown_file", None)
    summary = getattr(args, "summary", None)
    cover_url = getattr(args, "cover_url", None)
    column_id = getattr(args, "column_id", None)
    tag_ids = getattr(args, "tag_ids", None)
    published_at = getattr(args, "published_at", None)
    return {
        "title": getattr(args, "title", None) or old.get("title"),
        "summary": summary if summary is not None else old.get("summary", ""),
        "coverUrl": cover_url if cover_url is not None else old.get("coverUrl", ""),
        "content": read_markdown(markdown_file) if markdown_file else old.get("content"),
        "columnId": column_id if column_id is not None else (column or {}).get("id"),
        "tagIds": tag_ids if tag_ids is not None else [tag["id"] for tag in tags],
        "status": status,
        "publishedAt": published_at if published_at is not None else old.get("publishedAt"),
    }


def result_with_url(client: BlogClient, article: dict[str, Any]) -> dict[str, Any]:
    result = dict(article)
    result["article_url"] = f"{client.public_url}/blog/{article['slug']}"
    return result


def add_article_fields(parser: argparse.ArgumentParser, *, creating: bool) -> None:
    parser.add_argument("--title", required=creating)
    parser.add_argument("--summary")
    parser.add_argument("--markdown-file", required=creating)
    parser.add_argument("--cover-url")
    parser.add_argument("--column-id", type=int)
    parser.add_argument("--tag-id", dest="tag_ids", action="append", type=int)
    status = parser.add_mutually_exclusive_group()
    status.add_argument("--publish", action="store_true")
    if not creating:
        status.add_argument("--draft", action="store_true")
    parser.add_argument("--published-at", help="Asia/Shanghai local time, e.g. 2026-08-06T09:00:00")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("metadata", help="List available tags and columns")

    listing = subparsers.add_parser("list", help="Search articles")
    listing.add_argument("--keyword")
    listing.add_argument("--status", choices=["DRAFT", "PUBLISHED"])
    listing.add_argument("--page", type=int, default=1)
    listing.add_argument("--page-size", type=int, default=20, choices=range(1, 101), metavar="1..100")

    show = subparsers.add_parser("show", help="Read an article")
    show.add_argument("--article-id", type=int, required=True)

    create = subparsers.add_parser("create", help="Create an article; defaults to DRAFT")
    add_article_fields(create, creating=True)
    create.add_argument("--allow-duplicate-title", action="store_true")

    update = subparsers.add_parser("update", help="Update an article while preserving unspecified fields")
    update.add_argument("--article-id", type=int, required=True)
    add_article_fields(update, creating=False)

    status = subparsers.add_parser("set-status", help="Publish or unpublish an article")
    status.add_argument("--article-id", type=int, required=True)
    status.add_argument("--status", required=True, choices=["DRAFT", "PUBLISHED"])
    status.add_argument("--published-at", help="Asia/Shanghai local time")

    upload = subparsers.add_parser("upload-image", help="Upload an image to Qiniu media storage")
    upload.add_argument("--file", required=True)
    return parser


def run(args: argparse.Namespace) -> Any:
    client = BlogClient()
    if args.command == "metadata":
        return {
            "tags": client.get("/api/admin/tags"),
            "columns": client.get("/api/admin/columns"),
        }
    if args.command == "list":
        return client.get(
            "/api/admin/articles",
            {"keyword": args.keyword, "status": args.status, "page": args.page, "pageSize": args.page_size},
        )
    if args.command == "show":
        return result_with_url(client, client.get(f"/api/admin/articles/{args.article_id}"))
    if args.command == "upload-image":
        return client.upload(Path(args.file))
    if args.command == "create":
        if not args.allow_duplicate_title:
            matches = client.get(
                "/api/admin/articles", {"keyword": args.title, "page": 1, "pageSize": 100}
            )["items"]
            exact = [item for item in matches if item.get("title") == args.title]
            if exact:
                ids = ", ".join(str(item["id"]) for item in exact)
                raise PublisherError(
                    f"An article with the exact title already exists (ID: {ids}). "
                    "Update it or deliberately pass --allow-duplicate-title."
                )
        article = client.request("POST", "/api/admin/articles", payload=article_payload(args))
        return result_with_url(client, article)
    if args.command == "update":
        existing = client.get(f"/api/admin/articles/{args.article_id}")
        article = client.request(
            "PUT", f"/api/admin/articles/{args.article_id}", payload=article_payload(args, existing)
        )
        return result_with_url(client, article)
    if args.command == "set-status":
        article = client.request(
            "PATCH",
            f"/api/admin/articles/{args.article_id}/status",
            payload={"status": args.status, "publishedAt": args.published_at},
        )
        return result_with_url(client, article)
    raise PublisherError(f"Unsupported command: {args.command}")


def main() -> int:
    try:
        result = run(build_parser().parse_args())
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (PublisherError, OSError, KeyError, TypeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
