# Circle Match · Lean In Connect

A single Next.js (App Router) web app that helps new Lean In Connect members find
and request to join the most relevant peer Circles. See `README.md` for product
details, routes, data model, and the matching approach.

## Cursor Cloud specific instructions

- Single Next.js app rooted at the repo root. Package manager is **npm**
  (`package-lock.json`). Works on Node 20+ (verified on Node 22).
- The app runs **fully offline** with no external services. When the Supabase env
  vars are unset, `getDataStore()` transparently uses a labeled in-memory store, and
  a "Development fallback: using in-memory data" banner appears at the top. Supabase
  is optional; configure it via `.env.local` (`cp .env.example .env.local`) only if
  you want durable persistence.
- Standard commands live in `package.json`: `npm run dev` (serves on port 3000),
  `npm run lint`, `npm run typecheck`, `npm test` (vitest), `npm run build`.
- In-memory data (saved preferences and join requests) resets whenever the dev
  server restarts, so re-save preferences after a restart before testing `/matches`.
- Known dev quirk on this branch: after submitting the `/match` preferences form, the
  client-side auto-redirect to `/matches` can hang (a "Rendering…" badge appears and
  the view snaps back to `/match`). The preferences **are** saved server-side — just
  navigate to `/matches` via the top-nav "Circles" link (or reload) to continue. This
  is app-code behavior, not an environment problem.
