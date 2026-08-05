# Admin frontend agent guide

## Architecture

- Use React function components, strict TypeScript, and the `@/` source alias.
- Keep authentication in `src/auth/AuthContext.tsx`; protected pages must remain under the `Protected` route.
- Use `src/api/client.ts` for every API request. Preserve the API envelope, `credentials: 'include'`, global loading tracking, and 401 handling.
- Keep route-level screens in `src/pages`, reusable UI in `src/components`, and shell/navigation code in `src/layouts`.
- Never edit generated `dist` or `node_modules` content.

## API and forms

- Keep `src/api/types.ts` aligned with backend DTOs and enums.
- Send `null`, empty strings, and omitted values according to the existing backend contract; do not silently change field semantics.
- Display backend validation messages without exposing request bodies or secrets.
- After a mutation, refresh the affected list/detail so the UI reflects server state.
- Preserve request cancellation or stale-response protection in async screens.

## Article editor

- Keep Markdown as the canonical article content.
- Preserve image upload, media selection, fixed editor height, scrollbars, live preview, and bidirectional synchronized scrolling.
- Do not enable raw HTML rendering. The backend rejects dangerous HTML and the preview must not weaken that boundary.
- Publishing, unpublishing, deletion, password changes, and media deletion require explicit user intent.
- Do not infer or generate slugs in the admin UI; the backend owns them.

## Authentication and security

- Never read, store, or expose the Sa-Token value in JavaScript. Authentication is an HttpOnly Cookie.
- Never add credentials, cloud keys, private hosts, or production-only values to frontend code.
- Use same-origin `/api` URLs and keep CSRF-style Origin checks compatible with backend configuration.
- Avatar and media uploads must retain file type and size restrictions.

## Verification

From this directory, run:

```text
npm run build
npm run lint
```

For UI changes, verify login expiry, loading/error states, the affected mutation, and responsive layout. Report pre-existing lint failures separately from failures introduced by the change.
