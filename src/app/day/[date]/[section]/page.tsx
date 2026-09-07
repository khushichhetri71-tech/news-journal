import Link from "next/link";
import SectionNote from "@/components/SectionNote";
import { SECTIONS } from "@/lib/sections";
import { getEdition } from "@/lib/news";
import { prettyDate } from "@/lib/format";
import { SECTION_KEYS, type SectionKey } from "@/lib/types";

export const revalidate = 60;

function isSectionKey(s: string): s is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(s);
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ date: string; section: string }>;
}) {
  const { date, section } = await params;

  if (!isSectionKey(section)) {
    return <NotHere date={date} message="That section doesn't exist 🤔" />;
  }

  const edition = await getEdition(date);
  const articles = edition?.sections[section] ?? [];

  if (!edition || articles.length === 0) {
    return <NotHere date={date} message="No stories filed under this note 🙈" />;
  }

  const { label, emoji, theme } = SECTIONS[section];

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <Link
          href={`/day/${date}`}
          className="rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 text-lg shadow-sm transition hover:-translate-x-0.5 hover:bg-white"
        >
          ← all notes
        </Link>
        <span
          className="rounded-full px-3 py-1 text-lg"
          style={{ backgroundColor: theme.bg, color: theme.accent }}
        >
          {emoji} {label}
        </span>
      </div>

      <p className="mb-5 text-center font-heading text-2xl opacity-70">
        {prettyDate(date)}
      </p>

      <SectionNote section={section} articles={articles} date={date} tilt={0} />

      <div className="mt-8 text-center">
        <Link
          href={`/day/${date}`}
          className="text-xl underline decoration-wavy underline-offset-4 opacity-70 hover:opacity-100"
        >
          ← back to all notes
        </Link>
      </div>
    </main>
  );
}

function NotHere({ date, message }: { date: string; message: string }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-heading text-5xl font-bold">{message}</h1>
      <Link
        href={`/day/${date}`}
        className="mt-6 inline-block text-xl underline decoration-wavy underline-offset-4"
      >
        ← back to all notes
      </Link>
    </main>
  );
}
