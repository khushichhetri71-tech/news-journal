// The Daily Doodle — nightly news compiler.
//
// Flow: for each section, pull RSS → keep only items from the target IST day →
// dedupe by title → take the top N → summarize each into 3–4 complete
// sentences → write one "edition" to Supabase.
//
// Run:
//   node --env-file=.env.local scripts/fetch-news.mjs --dry-run   # print, no DB
//   node --env-file=.env.local scripts/fetch-news.mjs             # write to DB
//   ... --date=2026-08-31   # compile a specific IST day (default: yesterday)
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, GEMINI_MODEL

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const parser = new Parser({ timeout: 15000 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── args & env ───────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run") || process.env.DRY_RUN === "1";
const dateArg = argv.find((a) => a.startsWith("--date="))?.split("=")[1];
const TARGET_DATE = dateArg || process.env.TARGET_DATE || yesterdayIST();
// --sections=tech,finance → backfill only these sections (leaves others untouched)
const sectionsArg = argv.find((a) => a.startsWith("--sections="))?.split("=")[1];
const SECTIONS_FILTER = sectionsArg
  ? sectionsArg.split(",").map((s) => s.trim()).filter(Boolean)
  : null;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// ── date helpers (all "days" are IST calendar days) ──────────────────────────
function istYMD(d) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
function yesterdayIST() {
  const [y, m, d] = istYMD(new Date()).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

// ── text helpers ─────────────────────────────────────────────────────────────
function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function titleHash(t) {
  return createHash("sha1").update(normalizeTitle(t)).digest("hex").slice(0, 16);
}
// A short, clean outlet name derived from a feed/article URL.
function sourceFromUrl(url) {
  const u = (url || "").toLowerCase();
  if (u.includes("thehindu")) return "The Hindu";
  if (u.includes("moneycontrol")) return "Moneycontrol";
  if (u.includes("economictimes")) return "Economic Times";
  if (u.includes("livemint")) return "Mint";
  if (u.includes("business-standard")) return "Business Standard";
  if (u.includes("ndtvprofit")) return "NDTV Profit";
  if (u.includes("cnbc")) return "CNBC";
  if (u.includes("reuters")) return "Reuters";
  if (u.includes("investing.com")) return "Investing.com";
  if (u.includes("ndtv")) return "NDTV";
  if (u.includes("timesofindia") || u.includes("indiatimes")) return "Times of India";
  if (u.includes("bbc")) return "BBC News";
  if (u.includes("idrw")) return "idrw.org";
  if (u.includes("livefist")) return "Livefist";
  if (u.includes("gadgets360")) return "Gadgets360";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "news";
  }
}

// Google News titles look like "Headline text - The Hindu". Split the source off.
function splitTitleSource(rawTitle, fallbackSource) {
  const i = rawTitle.lastIndexOf(" - ");
  if (i > 20) {
    return { title: rawTitle.slice(0, i).trim(), source: rawTitle.slice(i + 3).trim() };
  }
  return { title: rawTitle.trim(), source: fallbackSource };
}
function cleanSnippet(s = "") {
  return s.replace(/\s+/g, " ").replace(/<[^>]*>/g, "").trim();
}
function firstSentences(text, n = 4) {
  const parts = text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+/g);
  if (!parts) return text.trim();
  return parts.slice(0, n).join(" ").trim();
}

function googleNewsUrl(query) {
  // when:2d gives a wide window; our own IST-day filter narrows to the exact day.
  const q = encodeURIComponent(`${query} when:2d`);
  return `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
}

// ── fetch one feed, resilient ────────────────────────────────────────────────
async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    const sourceHint = sourceFromUrl(url); // e.g. "The Hindu", not the long feed title
    return (feed.items || []).map((it) => ({
      rawTitle: it.title || "",
      link: it.link || "",
      isoDate: it.isoDate || it.pubDate || null,
      snippet: cleanSnippet(it.contentSnippet || it.content || ""),
      sourceHint,
    }));
  } catch (err) {
    console.warn(`  ⚠ feed failed (${url.slice(0, 60)}…): ${err.message}`);
    return null; // signal failure so we can mark the edition 'partial'
  }
}

// ── summarize with Gemini, fall back to the snippet ──────────────────────────
async function summarize(title, snippet) {
  const base = snippet && snippet.length > 40 ? snippet : title;
  if (!GEMINI_KEY) return firstSentences(base, 4);

  const prompt =
    `Rewrite this Indian news item as a self-contained brief of 3 to 4 complete sentences ` +
    `in plain factual tone. Base it STRICTLY on the headline and details given — do NOT invent ` +
    `facts, numbers, names, quotes, dates, or outcomes that are not present. If the details are ` +
    `thin, write fewer sentences rather than padding or guessing. No "read more", no teaser, ` +
    `no preamble. Return only the brief.\n\nHeadline: ${title}\nDetails: ${snippet}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const backoff = [4000, 10000];
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 220 },
        }),
      });
      if (res.status === 429 && attempt < 2) {
        await sleep(backoff[attempt]);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
      throw new Error("empty response");
    } catch (err) {
      if (attempt === 2) {
        console.warn(`  ⚠ summarize fell back to snippet: ${err.message}`);
        return firstSentences(base, 4);
      }
    }
  }
  return firstSentences(base, 4);
}

// ── build one section ────────────────────────────────────────────────────────
async function buildSection(key, cfg) {
  const urls = [];
  if (cfg.query) urls.push(googleNewsUrl(cfg.query));
  urls.push(...(cfg.directFeeds || []));
  const results = await Promise.all(urls.map(fetchFeed));
  const anyFailed = results.some((r) => r === null);
  const items = results.filter(Boolean).flat();

  // keep only the target IST day
  const sameDay = items.filter((it) => it.isoDate && istYMD(new Date(it.isoDate)) === TARGET_DATE);

  // dedupe by normalized title
  const seen = new Set();
  const unique = [];
  for (const it of sameDay) {
    const { title, source } = splitTitleSource(it.rawTitle, it.sourceHint);
    if (!title || title.length < 12) continue;
    const h = titleHash(title);
    if (seen.has(h)) continue;
    seen.add(h);
    unique.push({ ...it, title, source, hash: h });
  }

  // newest first, take the top N
  unique.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
  return { picked: unique.slice(0, PER_SECTION), anyFailed };
}

// ── main ─────────────────────────────────────────────────────────────────────
const config = JSON.parse(await readFile(path.join(HERE, "feeds.json"), "utf8"));
const SECTIONS = config.sections;
const PER_SECTION = config.perSection || 7;

console.log(`\n📰 Compiling edition for ${TARGET_DATE} (IST)${DRY_RUN ? "  [DRY RUN]" : ""}\n`);

let editionPartial = false;
const records = [];

for (const [key, cfg] of Object.entries(SECTIONS)) {
  if (SECTIONS_FILTER && !SECTIONS_FILTER.includes(key)) continue;
  process.stdout.write(`• ${key}: `);
  const { picked, anyFailed } = await buildSection(key, cfg);
  if (anyFailed) editionPartial = true;
  console.log(`${picked.length} stories`);

  for (let i = 0; i < picked.length; i++) {
    const it = picked[i];
    const summary = await summarize(it.title, it.snippet);
    records.push({
      edition_date: TARGET_DATE,
      section: key,
      title: it.title,
      summary,
      source_name: it.source || "news",
      source_url: it.link,
      position: i,
      title_hash: it.hash,
    });
    console.log(`    ${i + 1}. ${it.title.slice(0, 70)}  — ${it.source || "?"}`);
    if (GEMINI_KEY) await sleep(1000); // pace Gemini to stay under the free-tier rate limit
  }
}

console.log(`\nTotal: ${records.length} stories across ${Object.keys(SECTIONS).length} sections.`);

if (DRY_RUN) {
  console.log("\n(dry run — nothing written to the database)\n");
  console.log(JSON.stringify(records.slice(0, 2), null, 2));
  process.exit(0);
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("\n✖ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — cannot write. Use --dry-run to test without a DB.");
  process.exit(1);
}
if (records.length === 0) {
  console.error("\n✖ No stories found for that day — refusing to overwrite the edition with nothing.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// upsert the edition, then replace its articles (delete + insert = clean rerun)
const status = editionPartial ? "partial" : "complete";
let err;
({ error: err } = await supabase.from("editions").upsert({ date: TARGET_DATE, status }));
if (err) throw err;
// backfill mode deletes only the targeted sections; full mode clears the whole day
let del = supabase.from("articles").delete().eq("edition_date", TARGET_DATE);
if (SECTIONS_FILTER) del = del.in("section", SECTIONS_FILTER);
({ error: err } = await del);
if (err) throw err;
({ error: err } = await supabase.from("articles").insert(records));
if (err) throw err;

console.log(`\n✅ Wrote edition ${TARGET_DATE} (${status}) — ${records.length} stories.\n`);
