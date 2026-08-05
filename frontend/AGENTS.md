# Public frontend agent guide

## Architecture

- Use React function components and strict TypeScript.
- Keep route components in `src/pages`, shared components in `src/components`, and large home sections in `src/sections`.
- Use the `@/` alias for imports from `src`.
- Keep `HashRouter`; deployment currently relies on static hosting without route-specific server rendering.
- Use `src/api/client.ts` for HTTP calls and preserve `{ code, message, data }` handling, cookies, request cancellation, and global loading activity.
- Reuse `SiteContentContext` instead of fetching site content independently in multiple components.

## Content and localization

- Keep Chinese and English UI objects structurally identical in `src/i18n.tsx`.
- Dynamic site content comes from the API. Do not reintroduce static article/project databases as a second source of truth.
- Persist language with the existing `blog-language` key and keep `<html lang>` synchronized.
- Do not translate article Markdown based on UI language.

## UI behavior

- Preserve the established dark visual system, teal accent, responsive breakpoints, keyboard focus states, and reduced layout shift.
- Wrap async pages in the existing loading components.
- Keep Lenis and heading navigation compatible: table-of-contents IDs and rendered heading IDs must come from the same Markdown AST result.
- Do not reintroduce the removed full-screen grain/noise overlay.
- Project cards with a URL must remain keyboard accessible; external URLs open safely with `noreferrer`.

## Security

- Render Markdown without raw HTML support.
- Never add frontend secrets. Any value bundled by Vite is public.
- Use same-origin `/api` paths; do not hard-code private hosts or production infrastructure.
- Preserve safe external-link attributes and validate any new URL rendering behavior.

## Verification

From this directory, run:

```text
npm run build
npm run lint
```

At minimum, manually verify the affected route in both languages and at mobile and desktop widths. Do not edit `dist` or `node_modules`.
