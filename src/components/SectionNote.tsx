"use client";

import Sketch from "./Sketch";
import { SECTIONS } from "@/lib/sections";
import { useSectionReading } from "@/lib/reading";
import type { Article, SectionKey } from "@/lib/types";

// Entries at these positions get a doodle (3rd, 5th, 7th — 0-indexed).
const SKETCH_AT = [2, 4, 6];

export default function SectionNote({
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
  const { read, toggle, allRead } = useSectionReading(
    date,
    section,
    articles.length,
  );

  const noteVars = {
    "--note-bg": theme.bg,
    "--note-header": theme.header,
    "--note-accent": theme.accent,
    "--note-rule": theme.rule,
  } as React.CSSProperties;

  return (
    <section
      id={section}
      style={noteVars}
      className={`note relative rounded-2xl shadow-[3px_5px_14px_rgba(90,75,50,0.18)] ${
        tilt % 2 === 0 ? "-rotate-[0.4deg]" : "rotate-[0.5deg]"
      }`}
    >
      <div className="tape" aria-hidden />

      <header className="note-header flex items-center gap-2.5 rounded-t-2xl px-5 py-2.5">
        <span className="text-2xl leading-none">{emoji}</span>
        <h2 className="font-heading text-3xl font-bold tracking-wide text-[var(--note-accent)]">
          {label}
        </h2>
        {allRead && (
          <span className="caught-up ml-auto" aria-hidden>
            ✓ all read!
          </span>
        )}
      </header>

      <div className="note-body rounded-b-2xl pb-[28px] pl-12 pr-5 pt-[28px]">
        {articles.map((a, i) => {
          const sketchIdx = SKETCH_AT.indexOf(i);
          const sketch =
            sketchIdx >= 0 ? sketches[sketchIdx % sketches.length] : null;
          const isRead = read.includes(i);

          return (
            <div
              key={i}
              className={`mb-[28px] transition-opacity last:mb-0 ${
                isRead ? "opacity-55" : ""
              }`}
            >
              {sketch && (
                <Sketch
                  name={sketch}
                  className="float-right ml-3 mt-1 h-14 w-14 rotate-6 text-[var(--note-accent)] opacity-70"
                />
              )}
              <p>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={isRead}
                  aria-label={
                    isRead ? `Mark "${a.title}" unread` : `Mark "${a.title}" read`
                  }
                  className="bullet"
                >
                  {isRead ? "✓" : ""}
                </button>
                <strong className="text-[var(--note-accent)]">{a.title}:</strong>{" "}
                {a.summary}{" "}
                <a
                  href={a.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ga="article_link_click"
                  data-ga-section={section}
                  data-ga-source={a.source_name}
                  className="text-[var(--note-accent)] underline decoration-wavy decoration-1 underline-offset-4 [overflow-wrap:anywhere]"
                >
                  {a.source_name} ↗
                </a>
              </p>
            </div>
          );
        })}

        {allRead && (
          <div className="caught-up-banner" role="status">
            🎉 You&apos;ve read all of {label}!
          </div>
        )}
      </div>
    </section>
  );
}
