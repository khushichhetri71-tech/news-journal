import DateNav from "./DateNav";
import SectionCard from "./SectionCard";
import ReadingTracker from "./ReadingTracker";
import { SECTION_ORDER } from "@/lib/sections";
import { prettyDate } from "@/lib/format";
import type { Edition } from "@/lib/types";

export default function EditionView({
  edition,
  dates,
}: {
  edition: Edition;
  dates: string[];
}) {
  const totals = SECTION_ORDER.filter(
    (key) => (edition.sections[key]?.length ?? 0) > 0,
  ).map((key) => ({ section: key, total: edition.sections[key].length }));

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="font-heading text-4xl font-bold leading-tight sm:text-6xl">
          The Apple Times <span aria-hidden>🍎</span>
        </h1>
        <p className="mt-1 text-base opacity-70 sm:text-lg">
          daily news digest
        </p>
        <p className="font-heading mt-4 text-2xl sm:text-3xl">
          {prettyDate(edition.date)}
        </p>
        <div className="mt-3">
          <DateNav dates={dates} current={edition.date} />
        </div>
      </header>

      <ReadingTracker date={edition.date} totals={totals} />

      <div className="grid min-w-0 grid-cols-2 gap-4 sm:gap-8">
        {SECTION_ORDER.filter(
          (key) => (edition.sections[key]?.length ?? 0) > 0,
        ).map((key, i) => (
          <SectionCard
            key={key}
            section={key}
            articles={edition.sections[key]}
            date={edition.date}
            tilt={i}
          />
        ))}
      </div>

      <footer className="mt-12 text-center text-lg opacity-60">
        tap a note to open the full section ✍️
      </footer>
    </main>
  );
}
