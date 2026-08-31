# The Daily Doodle 📰

A daily news digest that looks like a middle-school journal. Four sections
(National 🇮🇳, International 🌍, Sports ⚽, Defence ✈️), each a pastel ruled
note with the day's stories in 3–4 complete sentences and a link to the
original source. One "edition" per calendar day, browsable by date — like
reading yesterday's paper.

## Run it

```bash
npm install
npm run dev   # → http://localhost:3000
```

Currently renders **dummy data** from `src/data/dummy/*.json` (two sample
days). The stories in there are made up — placeholders until the real
pipeline lands.

## How it's put together

- `src/lib/news.ts` — the data layer. The only file that knows where
  editions live. Currently reads the dummy JSON; will be swapped to
  Supabase queries without touching any UI code.
- `src/lib/sections.ts` — section labels, pastel themes, doodle assignments.
- `src/components/SectionNote.tsx` — one ruled note per section; entries
  at positions 3/5/7 get a doodle.
- `src/components/Sketch.tsx` — hand-drawn-style inline SVGs (jet, tank,
  ship, football, globe, India Gate…).
- `src/app/day/[date]/page.tsx` — any edition by date; `/` shows the latest.

The ruled-paper effect: `.note-body` in `globals.css` paints rules every
28px with the red margin line, and all note text keeps
`line-height: 28px` (margins in multiples of 28px) so writing sits exactly
on the lines.

## Roadmap

- [x] **Phase 1 — FE skeleton** with dummy data (this)
- [ ] **Phase 2 — Supabase**: free project, `editions` + `articles` tables,
      public-read RLS
- [ ] **Phase 3 — fetch script**: RSS per section → filter to the IST
      calendar day → dedupe → top 6–8/section → 3–4-sentence summaries →
      insert
- [ ] **Phase 4 — wire FE to Supabase** (rewrite `lib/news.ts` only)
- [ ] **Phase 5 — ship**: GitHub Actions cron `35 18 * * *` (= 00:05 IST,
      compiles the just-ended day) + Vercel deploy
- [ ] **Phase 6 — GA4** (page views, `article_link_click`, `date_change`)
      + polish
