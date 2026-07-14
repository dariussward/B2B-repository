# AGENTS.md

## Cursor Cloud specific instructions

Locus is a **frontend-only** Vite + React 19 + TypeScript single-page app (no backend, no database, no env vars, no external APIs). All market data is bundled in `src/data/locations.ts`.

Standard commands are documented in `README.md` and `package.json` scripts:
- `npm run dev` — start the Vite dev server (defaults to `http://localhost:5173`).
- `npm run build` — type-check + production build (`tsc -b && vite build`).
- `npm run preview` — serve the production build locally.

Non-obvious notes:
- **Lint:** there is no `lint` script and `oxlint` is not a declared dependency, but `.oxlintrc.json` is configured. Run lint with `npx oxlint` (downloads oxlint on first use; requires network).
- The app has three routes: `/` (landing), `/scout` (search/filter/shortlist workspace), and `/location/:id` (detail report). It uses `BrowserRouter`, so deep links work through the dev server.
