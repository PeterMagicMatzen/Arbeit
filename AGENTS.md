# Base44 Dev Environment

## Project Overview
Frontend-only React 19 + TypeScript + Vite 8 app (Relume/Mostar cinematic story site).
No backend, no database, no external services, no secrets required.

## Structure
- App source lives in `relume-mostar-site/` (not repo root).
- Uses `HashRouter` from react-router-dom (client-side routing only).
- Tailwind CSS 3 + PostCSS, Relume UI components.

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- Node 22 image, source bind-mounted at `/app`.
- Vite dev server on port 5173 (mapped to host 3000) with `--host 0.0.0.0`.
- `npm install` runs on container startup; `node_modules` in a named volume.
- Live reload / HMR is active — edits appear without rebuild.

## Health Check
Vite dev server responds on `http://localhost:5173/` (inside container).

## Notes
- `vite.config.ts` sets `base` to `/Arbeit/` when `GITHUB_PAGES` env is set; otherwise `/`. Not set in dev.
- No `.env` files needed.
