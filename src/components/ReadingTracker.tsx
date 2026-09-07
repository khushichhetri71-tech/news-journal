"use client";

import { useReadingProgress } from "@/lib/reading";

// Home-page reading tracker: shows how many sections you've finished today,
// and a celebration once every section is fully ticked off.
export default function ReadingTracker({
  date,
  totals,
}: {
  date: string;
  totals: { section: string; total: number }[];
}) {
  const { doneSections, totalSections } = useReadingProgress(date, totals);
  if (totalSections === 0) return null;

  const allDone = doneSections === totalSections;

  return (
    <div className="reading-tracker">
      {allDone ? (
        <div className="caught-up-day" role="status">
          🎉 You&apos;re all caught up on today&apos;s news! Well read. ✍️
        </div>
      ) : (
        <p className="text-base opacity-70 sm:text-lg">
          📖 {doneSections} / {totalSections} sections read — tick each story as
          you go
        </p>
      )}
    </div>
  );
}
