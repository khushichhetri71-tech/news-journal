"use client";

import { useCallback, useEffect, useState } from "react";

// Reading progress lives in the browser (localStorage), keyed by edition date —
// so it survives navigation and resets naturally each new day. No login/backend.

const KEY = (date: string) => `apple-times-read:${date}`;

type ReadMap = Record<string, number[]>; // section -> read article indices

function loadAll(date: string): ReadMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY(date)) || "{}") as ReadMap;
  } catch {
    return {};
  }
}

function saveAll(date: string, map: ReadMap) {
  try {
    localStorage.setItem(KEY(date), JSON.stringify(map));
    window.dispatchEvent(new Event("reading-updated"));
  } catch {
    /* storage disabled/full — degrade gracefully */
  }
}

/** Tick-tracking for one section's list on a section page. */
export function useSectionReading(date: string, section: string, total: number) {
  const [read, setRead] = useState<number[]>([]);

  useEffect(() => {
    setRead(loadAll(date)[section] ?? []);
  }, [date, section]);

  const toggle = useCallback(
    (index: number) => {
      setRead((prev) => {
        const next = prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index];
        const map = loadAll(date);
        map[section] = next;
        saveAll(date, map);
        return next;
      });
    },
    [date, section],
  );

  const allRead = total > 0 && read.length >= total;
  return { read, toggle, allRead };
}

/** How many sections are fully read — for the home-page "caught up" tracker. */
export function useReadingProgress(
  date: string,
  totals: { section: string; total: number }[],
) {
  const [map, setMap] = useState<ReadMap>({});

  useEffect(() => {
    const refresh = () => setMap(loadAll(date));
    refresh();
    window.addEventListener("reading-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("reading-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [date]);

  const doneSections = totals.filter(
    (t) => (map[t.section]?.length ?? 0) >= t.total,
  ).length;
  return { doneSections, totalSections: totals.length };
}
