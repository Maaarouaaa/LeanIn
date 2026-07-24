# Circle Match · Lean In Connect

Personalized Circle matching for Lean In Connect—helping a new member move from joining to belonging with a short preference flow, ranked Circles, and a persisted join request.

## 1. Project overview

Circle Match is a Next.js App Router prototype that asks a few high-signal questions, ranks Circles with an explainable score, and lets the member request to join. The product focus is the activation moment between signing up for Lean In Connect and finding a community that fits.

## 2. The user problem

Lean In Connect offers many Circles. Choosing from a large directory creates choice overload: a new member has to guess which room matches her goals, stage, schedule, and location. That friction delays belonging.

## 3. Why matching matters for Lean In

Lean In’s mission depends on women finding peer communities where they can practice leadership. Matching reduces the gap between intent and action—so more members land in Circles where they are likely to stay engaged.

## 4. Three-step experience

1. **Preferences** (`/match`) — goals (up to 3), career stage, format, frequency, location, availability.
2. **Matches** (`/matches`) — three ranked Circles with reasons; filters refine the view without rewriting saved preferences.
3. **Request** (`/circles/[slug]`) — Circle detail plus a join-request modal; pending state survives refresh and is scoped to that Circle.

Shared chrome: masthead (Lean In wordmark + profile icon), Preferences → Matches → Request progress indicator, Instagram/LinkedIn footer.

## 5. Design direction

Editorial Lean In visual language—not a generic dashboard:

- Ink `#171717`, butter yellow `#FFDA57`, warm paper `#F6F2E9`
- Lavender / lime accents; plum for editorial lines
- Barlow Condensed (display), Newsreader (editorial), IBM Plex Sans (UI)
- Organic image crops on cards/detail; `/match` hero uses a soft petal/wave yellow overlap over a rectangular photograph
- Thin black borders, pill controls, arrow-only View actions on cards

## 6. Technical architecture

| Layer | Choice |
| --- | --- |
| Framework | Next.js App Router, React 19, TypeScript, Tailwind CSS v4 |
| Preferences / ranking | Server Actions (`src/lib/actions/circle-match.ts`) |
| Join requests | `POST /api/circles/[slug]/join-requests` |
| Data | Supabase when configured; otherwise labeled in-memory fallback |
| Auth (demo) | httpOnly `circle_match_member` cookie → seeded demo profile |

Repository selection lives in `src/lib/data/store.ts`. Valid public Supabase env vars + a successful circles probe select Supabase; otherwise the UI shows a development fallback banner and uses memory.

## 7. Supabase data model

| Table | Role |
| --- | --- |
| `profiles` | Demo member + JSON preferences |
| `circles` | Catalog (topics, format, schedule, imagery, weeknight flag, leader) |
| `join_requests` | Note + status; **unique `(profile_id, circle_id)`** |

Migrations: `supabase/migrations/001_circle_match_schema.sql`, `002_join_requests_unique_profile_circle.sql`  
Seed: `supabase/seed.sql`

RLS is enabled with open demo policies suitable for this assignment (server writes prefer the service-role / secret key). Not multi-tenant production auth.

## 8. Matching score (plain language)

Each Circle gets a weighted score from the member’s preferences:

| Signal | Weight |
| --- | ---: |
| Goal / topic overlap | 40% |
| Meeting format | 15% |
| Location | 15% |
| Frequency | 10% |
| Career stage | 10% |
| Availability | 10% |

Scores are soft (no hard exclusion). Ranking is deterministic: higher score first, then Circle name. The server returns the full ranked list; `/matches` shows the top three. Client filters re-slice that ranked list—they do not re-score or overwrite preferences.

## 9. What is real

- Circle catalog data (seeded / Supabase)
- Preference validation and persistence
- Server-side ranking and match reasons
- Client filters on ranked results
- Join requests persisted with duplicate protection
- Pending / sent CTA scoped to `profile_id` + `circle_id` after refresh
- Empty, error, loading, and success states on the core path

## 10. What is mocked

- **Seeded demo member** — no signup; middleware provisions a demo cookie
- **Authentication provider** — not implemented for this assignment
- **Circle-leader review workflow** — no approval inbox or email; status remains pending unless changed in data

## 11. Accessibility

Semantic headings; fieldsets/legends for preference groups; visible `focus-visible` rings; `aria-describedby` for errors; modal focus trap, Escape, and restore; `aria-live` for join status and filter updates; icon-only controls labeled (`My profile`, social links, View); decorative SVGs `aria-hidden`; meaningful image alts; `prefers-reduced-motion` respected in shared motion utilities.

## 12. Scope and tradeoffs

- One demo member, not full multi-user auth
- Open RLS for demo simplicity; tighten before production multi-tenant use
- Filters refine display only; they do not mutate the saved ranking in the database
- Leader approval is out of scope

## 13. What would be built next

Real auth, leader inbox for join requests, email notifications, richer location matching, analytics on activation, and stricter RLS tied to the authenticated member.

## 14. Local setup

```bash
npm install
cp .env.example .env.local   # optional — fill Supabase values
npm run dev
```

Without Supabase env vars, the app runs on the in-memory fallback (banner shown).

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 15. Supabase migration and seed

1. Create a Supabase project.
2. Set in `.env.local` (names only in `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` (server writes)
3. Run SQL in order:
   - `supabase/migrations/001_circle_match_schema.sql`
   - `supabase/migrations/002_join_requests_unique_profile_circle.sql`
   - `supabase/seed.sql`
4. Restart `npm run dev`. Confirm the memory-fallback banner is gone.

`.env.local` is gitignored. Never put the service-role / secret key in a `NEXT_PUBLIC_` variable.

## 16. Deployment

1. Host on Vercel (or any Next.js host).
2. Set the same env vars in the host dashboard (public URL + anon key; service/secret key server-only).
3. Apply migrations + seed to the production Supabase project before first traffic.
4. `npm run build` locally or in CI to verify.
5. Deploy. Smoke-test `/match` → `/matches` → Circle detail → join request → refresh.

Manual actions still required: create Supabase project, paste env vars, run SQL, connect the host.
