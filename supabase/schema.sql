-- The Daily Doodle — database schema
-- Run this once in Supabase → SQL Editor (paste all, click Run).

-- One row per daily edition (the day the news happened, IST).
create table if not exists editions (
  date        date primary key,
  compiled_at timestamptz default now(),
  status      text default 'complete'   -- 'partial' if some feeds failed that night
);

-- One row per story within an edition.
create table if not exists articles (
  id           uuid primary key default gen_random_uuid(),
  edition_date date not null references editions(date) on delete cascade,
  section      text not null check (section in ('national','international','sports','defence','tech','finance')),
  title        text not null,
  summary      text not null,           -- 3–4 complete sentences (the whole story)
  source_name  text not null,
  source_url   text not null,
  position     int  not null,           -- order within the section
  title_hash   text not null            -- normalized-title hash, for dedupe
);

create index if not exists articles_edition_section_pos
  on articles (edition_date, section, position);

-- Safety net: if the nightly job runs twice, it can't insert duplicates.
create unique index if not exists articles_edition_titlehash
  on articles (edition_date, title_hash);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- The whole world may READ (it's a news site); nobody may write via the public
-- (anon) key. Writes happen only from the nightly job using the service_role
-- key, which bypasses RLS.
alter table editions enable row level security;
alter table articles enable row level security;

drop policy if exists "public read editions" on editions;
drop policy if exists "public read articles" on articles;
create policy "public read editions" on editions for select using (true);
create policy "public read articles" on articles for select using (true);
