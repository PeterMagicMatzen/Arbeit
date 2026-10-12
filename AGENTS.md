# Base44 Dev Environment

## Project
Vite + React 19 + TypeScript static site (`relume-mostar-site/`). Two routes via `HashRouter`:
- `/` — Mostar cinematic scroll story
- `/#/efeuhaus` — Efeuhaus parallax hero + story sections

## Running
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
- Web entry point: `http://localhost:3000`
- Dev server: Vite with live reload (bind-mounted source, no rebuild needed for edits)
- Dependencies installed on container startup via `npm install`

## Verification
- `npx tsc -b` — TypeScript type check (passes clean)
- `npx vite build` — production build (passes clean)
- Healthcheck: `curl http://localhost:3000/` returns 200

## Notes
- `tailwind.config.js` uses `require()` inside an ESM `export default` — handled by Vite/PostCSS tooling, works correctly.
- `vite.config.ts` sets `base` to `/Arbeit/` when `GITHUB_PAGES` env is set, otherwise `/`.
- `src/lib/asset.ts` resolves public asset paths against `import.meta.env.BASE_URL`.
- Routes are hash-based (`HashRouter`); navigate to `/#/efeuhaus` not `/efeuhaus`.
