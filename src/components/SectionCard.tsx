import Link from "next/link";
import Sketch from "./Sketch";
import { SECTIONS } from "@/lib/sections";
import type { Article, SectionKey } from "@/lib/types";

// Compact preview tile for the 2×2 home grid. Shows the top couple of
// headlines as a teaser; the whole tile links to the full section page.
export default function SectionCard({
  section,
  articles,
  date,
  tilt,
}: {
  section: SectionKey;
  articles: Article[];
  date: string;
  tilt: number;
}) {
  const { label, emoji, theme, sketches } = SECTIONS[section];
  const preview = articles.slice(0, 2);
  const rest = Math.max(0, articles.length - preview.length);

  const noteVars = {
    "--note-bg": theme.bg,
    "--note-header": theme.header,
    "--note-accent": theme.accent,
    "--note-rule": theme.rule,
  } as React.CSSProperties;

  return (
    <Link
      href={`/day/${date}/${section}`}
      style={noteVars}
      aria-label={`Open ${label} news`}
      data-ga="section_open"
      data-ga-section={section}
      className={`note group relative flex min-w-0 flex-col rounded-2xl shadow-[3px_5px_14px_rgba(90,75,50,0.18)] transition-transform hover:-translate-y-1 hover:rotate-0 focus-visible:-translate-y-1 ${
        tilt % 2 === 0 ? "-rotate-[0.5deg]" : "rotate-[0.6deg]"
      }`}
    >
      <div className="tape" aria-hidden />

      <header className="note-header flex min-w-0 items-center gap-2 rounded-t-2xl px-3 py-2 sm:px-4">
        <span className="text-lg leading-none sm:text-2xl">{emoji}</span>
        <h2 className="font-heading min-w-0 truncate text-xl font-bold tracking-wide text-[var(--note-accent)] sm:text-3xl">
          {label}
        </h2>
      </header>

      <div className="note-body-compact flex-1 rounded-b-2xl pb-4 pl-9 pr-3 pt-3 sm:pl-11 sm:pr-4">
        <Sketch
          name={sketches[0]}
          className="float-right ml-2 h-10 w-10 rotate-6 text-[var(--note-accent)] opacity-60 sm:h-12 sm:w-12"
        />
        {preview.map((a, i) => (
          <p key={i} className="mb-1.5 flex min-w-0 gap-2">
            <span className="bullet shrink-0" aria-hidden></span>
            <span className="line-clamp-2 min-w-0 break-words [overflow-wrap:anywhere] text-[var(--note-accent)]">
              {a.title}
            </span>
          </p>
        ))}

        <p className="mt-2 text-sm font-semibold text-[var(--note-accent)] opacity-80 group-hover:opacity-100">
          {rest > 0 ? `+${rest} more ` : ""}·  open note ↗
        </p>
      </div>
    </Link>
  );
}
