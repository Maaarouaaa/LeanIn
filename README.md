# Circle Match · Lean In Connect

A polished editorial prototype that helps new Lean In Connect members find and request to join the most relevant Circles.

Focus: the **activation moment** between joining Lean In Connect and finding meaningful community.

## Product problem and rationale

Lean In Connect offers many ways to participate, but a new member still has to figure out where she belongs. Circle Match asks a few high-signal preference questions, ranks Circles with an explainable score, and lets the member request to join—with persisted pending state.

## Design decisions

Visual system from the supplied editorial handoff:

- Ink `#171717`, butter yellow `#FFDA57`, warm paper `#F6F2E9`
- Magenta / lavender / lime for selection and ranking states
- Plum for editorial statements, error red for validation
- Condensed display type (Bebas Neue), warm serif (Libre Baskerville), clean product sans (IBM Plex Sans)
- Organic image crops, oversized outline words, thin black borders, pill controls

Shared components power all three routes so the experience stays coherent.

## Routes

| Route | Purpose |
| --- | --- |
| `/match` | Preferences form (goals up to 3, stage, format, frequency, location, availability) |
| `/matches` | Top 3 ranked Circles with featured dark result + filters |
| `/circles/[slug]` | Circle detail + request-to-join modal |

## Technical architecture

- Next.js App Router + TypeScript + Tailwind CSS v4
- Server Actions for preferences + ranking
- `POST /api/circles/[slug]/join-requests` for persisted join requests
- Demo auth via httpOnly cookie (`circle_match_member`), provisioned in middleware
- Data layer: Supabase when configured, otherwise labeled in-memory fallback

## Data model

- `profiles` — demo member + JSON preferences
- `circles` — catalog with topics, format, next meeting, imagery, weeknight flag
- `join_requests` — unique `(profile_id, circle_id)` with status + timestamps

Schema: `supabase/migrations/001_circle_match_schema.sql`  
Seed: `supabase/seed.sql` (includes Bay Area Leadership Lab, Women Building in Tech, Founders in Progress)

## Matching approach

Deterministic weighted score:

| Signal | Weight |
| --- | ---: |
| Goal / topic overlap | 40% |
| Format preference | 15% |
| Location compatibility | 15% |
| Meeting frequency | 10% |
| Career stage | 10% |
| Availability | 10% |

`includeVirtualOutsideLocation` affects virtual Circle location scoring. Server returns percentage + human-readable reasons.

## What is real versus mocked

**Real:** preference persistence, server ranking, join-request API with duplicate protection, pending CTA after refresh, validation/loading/empty/error/success states.

**Mocked / deferred:** full auth provider, leader approval inbox, email notifications. Demo profile is auto-authenticated for reviewers.

## Accessibility

Semantic fieldsets/labels, visible focus rings, non-color selection cues, `aria-describedby` errors, modal focus trap + Escape + restoration, `aria-live` for filter changes, WCAG AA-oriented contrast, `prefers-reduced-motion`.

## Local setup

```bash
npm install
cp .env.example .env.local   # optional Supabase
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Assumptions

1. Handoff asset folder images were not present in the workspace; editorial photography uses optimized local Unsplash-sourced assets under `public/assets/`.
2. Demo cookie auth stands in for a real authenticated member while keeping the API auth-gated.
3. Filters on `/matches` refine the already server-ranked top results client-side without discarding saved preferences.
