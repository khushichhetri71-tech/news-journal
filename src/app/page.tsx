import EditionView from "@/components/EditionView";
import { getAvailableDates, getEdition } from "@/lib/news";

export default async function Home() {
  const dates = await getAvailableDates();
  const latest = dates.at(-1);
  const edition = latest ? await getEdition(latest) : null;

  if (!edition) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-heading text-5xl font-bold">
          The press is warming up 🖨️
        </h1>
        <p className="mt-4 text-xl opacity-70">
          No editions have been printed yet — come back after the first nightly
          run.
        </p>
      </main>
    );
  }

  return <EditionView edition={edition} dates={dates} />;
}
