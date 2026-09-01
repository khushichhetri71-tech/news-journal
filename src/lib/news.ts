import fs from "node:fs/promises";
import path from "node:path";
import type { Article, Edition, SectionKey } from "./types";
import { SECTION_KEYS } from "./types";
import { supabaseConfigured, getSupabase } from "./supabase";

// ─── Data layer ──────────────────────────────────────────────────────────────
// The only file that knows where editions come from. If Supabase is configured
// (env vars present) it reads the database; otherwise it falls back to the dummy
// JSON in src/data/dummy so local dev works with no backend. The UI calls the
// same three functions either way.
// ─────────────────────────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATA_DIR = path.join(process.cwd(), "src", "data", "dummy");

function emptySections(): Record<SectionKey, Article[]> {
  const acc = {} as Record<SectionKey, Article[]>;
  for (const key of SECTION_KEYS) acc[key] = [];
  return acc;
}

/** All dates that have an edition, sorted oldest → newest. */
export async function getAvailableDates(): Promise<string[]> {
  if (supabaseConfigured) {
    const { data, error } = await getSupabase()
      .from("editions")
      .select("date")
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => r.date as string);
  }

  try {
    const files = await fs.readdir(DATA_DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .filter((d) => DATE_RE.test(d))
      .sort();
  } catch {
    return [];
  }
}

export async function getLatestDate(): Promise<string | null> {
  const dates = await getAvailableDates();
  return dates.at(-1) ?? null;
}

/** One day's edition, or null if that day was never compiled. */
export async function getEdition(date: string): Promise<Edition | null> {
  if (!DATE_RE.test(date)) return null; // guards both the query and the file path

  if (supabaseConfigured) {
    const { data, error } = await getSupabase()
      .from("articles")
      .select("section,title,summary,source_name,source_url,position")
      .eq("edition_date", date)
      .order("section", { ascending: true })
      .order("position", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return null;

    const sections = emptySections();
    for (const row of data) {
      const key = row.section as SectionKey;
      if (sections[key]) {
        sections[key].push({
          title: row.title as string,
          summary: row.summary as string,
          source_name: row.source_name as string,
          source_url: row.source_url as string,
        });
      }
    }
    return { date, sections };
  }

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${date}.json`), "utf8");
    return JSON.parse(raw) as Edition;
  } catch {
    return null;
  }
}
