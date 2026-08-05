# Repository agent guide

## Scope

This repository contains three independently built applications:

- `frontend`: public React blog
- `app`: React administration console
- `backend`: Spring Boot API

Read the nearest child `AGENTS.md` before editing a subproject. Child instructions override this file for their directory.

## Cross-project rules

- Keep public API request and response types synchronized across `backend`, `frontend`, and `app`.
- Preserve the standard API envelope: `{ code, message, data }`.
- Do not place secrets, tokens, passwords, private IPs, production paths, certificates, or real `.env` values in source, docs, examples, logs, or command output.
- Never edit generated folders such as `node_modules`, `dist`, or `target`.
- Do not commit `backend/.env` or `backend/config/application.yml`; update their checked-in example files instead.
- Treat existing Flyway migrations as immutable after release. Add a new migration for schema or seed changes.
- Keep Markdown raw HTML restrictions aligned between the backend validator and frontend renderer.
- Preserve Chinese and English UI parity. Article content itself is not translated.

## Verification

Run checks for every affected project:

```text
frontend: npm run build
app:      npm run build
backend:  mvn test
```

Run lint when changing TypeScript, but distinguish new failures from known repository-wide lint debt. Never claim a successful publish or deployment without verifying the target state.

## Change hygiene

- Prefer focused changes and retain the existing architecture and package manager lockfiles.
- Keep local user changes intact; do not reset unrelated files.
- Update the relevant README when setup, configuration, endpoints, or deployment behavior changes.
- Before public release, inspect ignored files and scan the complete Git history for secrets.
