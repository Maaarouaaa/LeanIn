# Circle Match · Lean In Connect

A polished take-home prototype that helps new Lean In Connect members find and request to join the most relevant Lean In Circles.

This project focuses on the **activation moment** between joining Lean In Connect and finding meaningful community—shortening the distance from “I’m here” to “this Circle feels like mine.”

## Product problem and rationale

Lean In Connect offers many ways to participate, but a new member still has to figure out where she belongs. Circles are intimate by design; browsing a large catalog without guidance can delay that first sense of belonging.

Circle Match asks a few high-signal preference questions, ranks Circles with an explainable score, and lets the member request to join—persisting pending state so the action feels real.

## Design decisions

- **Visual continuity with Lean In Connect**: burgundy (`#922A3A`), warm off-white (`#FBF8F6`), near-black ink, soft blush selected states, thin borders, generous spacing.
- **Editorial typography**: Newsreader for headings, DM Sans for UI/body via `next/font`.
- **Restrained composition**: spacious layouts rather than floating card grids; the first match is emphasized without diminishing others.
- **Warm, credible copy**: specific product language instead of placeholders.
- **Motion**: subtle page enter, modal scale-in, and toast feedback—with `prefers-reduced-motion` support.

## Technical architecture

- **Next.js App Router** + TypeScript + Tailwind CSS v4
- **Server Actions** for saving preferences, ranking matches, creating join requests, and reading request status
- **Matching logic** isolated in `src/lib/matching.ts` (pure, unit-tested)
- **Data layer** abstracted behind `DataStore`:
  - Supabase implementation when env vars are present
  - Labeled in-memory fallback for local review without credentials
- Seeded **demo profile** (`Amina Okonkwo`) so reviewers can use the flow without auth

### Routes

| Route | Purpose |
| --- | --- |
| `/` | Orientation landing |
| `/match` | Personalized matching form |
| `/matches` | Ranked Circle recommendations |
| `/circles/[slug]` | Circle detail + join request modal |

## Data model

- **`profiles`**: demo member + JSON preferences
- **`circles`**: Circle catalog (topics, format, location, schedule, leader, members)
- **`join_requests`**: unique `(profile_id, circle_id)` pending/approved/declined requests

Schema + seed live in:

- `supabase/migrations/001_circle_match_schema.sql`
- `supabase/seed.sql`

## Matching approach

Deterministic weighted score:

| Signal | Weight |
| --- | ---: |
| Goal / topic overlap | 45% |
| Format preference | 20% |
| Location compatibility | 15% |
| Meeting frequency | 10% |
| Career stage | 10% |

The server returns both the numeric score and human-readable reasons. Rankings are stable for identical inputs.

## What is real versus mocked

**Real**

- Preference persistence (Supabase or in-memory)
- Server-side ranking
- Join request create + duplicate protection
- Pending CTA / confirmation after refresh (within the active data store)
- Validation, loading, empty, error, and success states

**Mocked / deferred**

- Authentication (demo profile only; data layer is structured for future auth)
- Circle leader approval workflow
- Notifications / email
- Production analytics

If Supabase env vars are missing, a **visible banner** indicates the in-memory development fallback. The Supabase implementation remains complete and is used automatically when configured.

## Accessibility considerations

- Semantic headings, fieldsets/legends, labels
- Keyboard-operable chips, cards, and modal
- Focus trap + focus restoration in the join modal
- Visible `:focus-visible` rings
- WCAG AA-oriented contrast on core text/actions
- `prefers-reduced-motion` disables non-essential animation
- Skip link, comfortable touch targets, no intentional horizontal overflow

## Tradeoffs made for the time limit

- Demo profile instead of full auth
- CSS visual treatments for Circles instead of a full image CMS
- Lightweight format filtering on matches (not a full search stack)
- RLS policies kept permissive for the prototype; tighten with auth later

## What I would build next

1. Real authentication and per-user preferences
2. Circle leader inbox for approving/declining requests
3. Preference versioning and “match explanation” analytics
4. Richer location/geocoding for metro-area matching
5. Saved Circles + post-join onboarding checklist

## Local setup

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill in values when using Supabase:

```bash
cp .env.example .env.local
```

Required for Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional but recommended for server writes)

Without these, the app runs on the labeled in-memory store.

### 3. Database (Supabase)

In the Supabase SQL editor (or CLI), run:

1. `supabase/migrations/001_circle_match_schema.sql`
2. `supabase/seed.sql`

### 4. Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment

Deploy as a standard Next.js app (Vercel recommended):

1. Set the environment variables above
2. Apply the SQL migration + seed to your Supabase project
3. Deploy the repository

The production build does not require Supabase at build time; configure env vars in the host before runtime use.
