import fs from "node:fs/promises";
import path from "node:path";
import type { Edition } from "./types";

// ─── Data layer ──────────────────────────────────────────────────────────────
// The ONLY file that knows where editions live. Today: dummy JSON files in
// src/data/dummy. Phase 4: replace the bodies of these three functions with
// Supabase queries (editions + articles tables) and nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "src", "data", "dummy");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** All dates that have an edition, sorted oldest → newest. */
export async function getAvailableDates(): Promise<string[]> {
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
  if (!DATE_RE.test(date)) return null; // also guards the filesystem path
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${date}.json`), "utf8");
    return JSON.parse(raw) as Edition;
  } catch {
    return null;
  }
}
