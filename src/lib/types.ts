export const SECTION_KEYS = [
  "national",
  "international",
  "sports",
  "defence",
  "tech",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export interface Article {
  title: string;
  summary: string; // 3–4 complete sentences — the whole story, no teaser
  source_name: string;
  source_url: string;
}

export interface Edition {
  date: string; // YYYY-MM-DD (IST calendar day the news happened)
  sections: Record<SectionKey, Article[]>;
}
