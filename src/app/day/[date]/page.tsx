import Link from "next/link";
import EditionView from "@/components/EditionView";
import { getAvailableDates, getEdition } from "@/lib/news";

export const revalidate = 1800;

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const [dates, edition] = await Promise.all([
    getAvailableDates(),
    getEdition(date),
  ]);

  if (!edition) {
    const latest = dates.at(-1);
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-heading text-5xl font-bold">
          No paper that day 🙈
        </h1>
        <p className="mt-4 text-xl opacity-70">
          The Daily Doodle didn&apos;t print an edition for {date}.
        </p>
        {latest && (
          <Link
            href={`/day/${latest}`}
            className="mt-6 inline-block text-xl underline decoration-wavy underline-offset-4"
          >
            read the latest edition →
          </Link>
        )}
      </main>
    );
  }

  return <EditionView edition={edition} dates={dates} />;
}
