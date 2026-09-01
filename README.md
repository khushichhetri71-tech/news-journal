# The Daily Doodle 📰

A daily news digest that looks like a middle-school journal. Four sections
(National 🇮🇳, International 🌍, Sports ⚽, Defence ✈️) shown as a 2×2 grid of
pastel ruled notes; tap a note to open the full section. Each story is 3–4
complete sentences with a link to the original source. One "edition" per
IST calendar day, browsable by date — like reading yesterday's paper.

## How it works

```
GitHub Actions cron (00:05 IST)                Next.js site (Vercel)
   scripts/fetch-news.mjs                          reads by date
        │                                               ▲
   RSS per section                                      │
   → filter to the IST day                              │
   → dedupe → top 7/section        ┌──────────────┐     │
   → summarize (Gemini)  ─────────▶│  Supabase    │─────┘
   → write one edition             │  (Postgres)  │
                                    └──────────────┘
```

- **Frontend** — Next.js (App Router) + Tailwind, deploys on Vercel.
- **Backend** — no server. A nightly script writes to Supabase Postgres; the
  site reads from it. `src/lib/news.ts` is the only data-access file — if
  Supabase env vars are absent it falls back to dummy JSON in `src/data/dummy`,
  so local dev works with zero setup.
- **Content** — `scripts/fetch-news.mjs` pulls RSS (Google News search per
  section + optional direct feeds in `scripts/feeds.json`), keeps the target
  IST day, dedupes by title, takes the top 7, and summarizes each with Gemini.
- **Analytics** — GA4, on only if `NEXT_PUBLIC_GA_ID` is set. Custom events:
  `section_open`, `article_link_click`, `date_change`.

## Run locally

```bash
npm install
npm run dev          # → the port it prints (3000 if free)
```

With no `.env.local`, it renders the dummy sample days. To use real data,
`cp .env.example .env.local` and fill it in (see below).

## Backend setup

**1. Supabase** — create a free project (Mumbai region). In **SQL Editor**,
paste and run `supabase/schema.sql`. From **Settings → API** copy:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secret — script only)

**2. Gemini** — get a free API key from Google AI Studio → `GEMINI_API_KEY`.

**3. Compile an edition:**
```bash
node scripts/fetch-news.mjs --dry-run                 # print, no DB, no keys needed
node --env-file=.env.local scripts/fetch-news.mjs     # write to Supabase
node --env-file=.env.local scripts/fetch-news.mjs --date=2026-08-31
```

## Deploy

- **Vercel** — import the repo, add `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `NEXT_PUBLIC_GA_ID`.
- **Cron** — `.github/workflows/fetch-news.yml` runs at **00:05 IST** daily
  (and via the manual "Run workflow" button). Add repo **Actions secrets**:
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`.

## Known v1 limitations (future improvements)

- Source links are Google News redirect URLs (they open the real article).
- Near-duplicate stories from different outlets can slip past exact-title
  dedupe; summaries are built from the feed snippet, not full article text.
- Broad section queries occasionally cross topics. Tune `scripts/feeds.json`.

## Roadmap

- [x] Phase 1 — FE skeleton + journal UI (dummy data)
- [x] Phase 2 — Supabase schema + RLS (`supabase/schema.sql`)
- [x] Phase 3 — fetch/dedupe/summarize script (`scripts/fetch-news.mjs`)
- [x] Phase 4 — FE reads Supabase (dummy fallback)
- [x] Phase 5 — GitHub Actions cron + Vercel deploy config
- [x] Phase 6 — GA4 events
- [ ] Live: plug in keys, run the first real edition, deploy
