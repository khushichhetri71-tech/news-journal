import type { SectionKey } from "./types";
import type { SketchName } from "@/components/Sketch";

interface SectionTheme {
  bg: string; // note paper
  header: string; // header strip
  accent: string; // headings, links, sketches
  rule: string; // ruled lines
}

export interface SectionConfig {
  label: string;
  emoji: string;
  theme: SectionTheme;
  sketches: SketchName[];
}

export const SECTIONS: Record<SectionKey, SectionConfig> = {
  national: {
    label: "National",
    emoji: "🇮🇳",
    theme: {
      bg: "#DFF3E6",
      header: "#C2E6D0",
      accent: "#2E7D51",
      rule: "rgba(46, 125, 81, 0.16)",
    },
    sketches: ["indiagate", "flag", "chakra"],
  },
  international: {
    label: "International",
    emoji: "🌍",
    theme: {
      bg: "#FBF3D2",
      header: "#F2E2A9",
      accent: "#96751C",
      rule: "rgba(150, 117, 28, 0.16)",
    },
    sketches: ["globe", "paperplane", "eiffel"],
  },
  sports: {
    label: "Sports",
    emoji: "⚽",
    theme: {
      bg: "#FBE3EA",
      header: "#F5C7D6",
      accent: "#B14D74",
      rule: "rgba(177, 77, 116, 0.16)",
    },
    sketches: ["football", "hockey", "trophy"],
  },
  defence: {
    label: "Defence",
    emoji: "✈️",
    theme: {
      bg: "#DEEBF9",
      header: "#C3DCF3",
      accent: "#3D6DA8",
      rule: "rgba(61, 109, 168, 0.16)",
    },
    sketches: ["jet", "tank", "ship"],
  },
};

/** Sections in the order they appear on the page. */
export const SECTION_ORDER: SectionKey[] = [
  "national",
  "international",
  "sports",
  "defence",
];
