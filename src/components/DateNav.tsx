"use client";

import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

export default function DateNav({
  dates,
  current,
}: {
  dates: string[]; // sorted oldest → newest
  current: string;
}) {
  const router = useRouter();
  const idx = dates.indexOf(current);
  const prev = idx > 0 ? dates[idx - 1] : null;
  const next = idx >= 0 && idx < dates.length - 1 ? dates[idx + 1] : null;

  const go = (date: string) => {
    track("date_change", { date });
    router.push(`/day/${date}`);
  };

  const arrowCls =
    "rounded-lg border border-black/10 bg-white/70 px-3 py-1 text-lg shadow-sm transition hover:bg-white disabled:opacity-30";

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        className={arrowCls}
        onClick={() => prev && go(prev)}
        disabled={!prev}
        aria-label="Previous day"
      >
        ←
      </button>
      <input
        type="date"
        value={current}
        min={dates[0]}
        max={dates.at(-1)}
        onChange={(e) => e.target.value && go(e.target.value)}
        className="rounded-lg border border-black/10 bg-white/70 px-3 py-1 font-hand text-lg shadow-sm"
      />
      <button
        className={arrowCls}
        onClick={() => next && go(next)}
        disabled={!next}
        aria-label="Next day"
      >
        →
      </button>
    </div>
  );
}
