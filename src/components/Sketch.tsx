export type SketchName =
  | "jet"
  | "tank"
  | "ship"
  | "football"
  | "hockey"
  | "trophy"
  | "globe"
  | "paperplane"
  | "eiffel"
  | "indiagate"
  | "flag"
  | "chakra"
  | "laptop"
  | "robot"
  | "chip"
  | "chartup"
  | "bars"
  | "coins";

// Hand-drawn-style doodles, one stroke colour (currentColor) so each
// section tints its own sketches via the accent colour.
const PATHS: Record<SketchName, React.ReactNode> = {
  jet: (
    <>
      {/* top-view fighter: nose, swept wings, tail fins */}
      <path d="M32 5 L36 20 L55 33 L37 31 L37 45 L45 54 L33 50 L21 54 L29 45 L29 31 L11 33 L28 20 Z" />
      <path d="M32 12 v6" />
      <path d="M20 60 h8 M36 60 h8" strokeDasharray="3 4" />
    </>
  ),
  tank: (
    <>
      <rect x="8" y="38" width="48" height="14" rx="7" />
      <circle cx="18" cy="45" r="2.5" />
      <circle cx="27" cy="45" r="2.5" />
      <circle cx="36" cy="45" r="2.5" />
      <circle cx="45" cy="45" r="2.5" />
      <path d="M22 38 v-8 a4 4 0 0 1 4 -4 h10 a4 4 0 0 1 4 4 v8" />
      <path d="M40 30 L59 26" />
      <path d="M28 26 h6" />
    </>
  ),
  ship: (
    <>
      <path d="M7 40 L14 52 H50 L57 40 Z" />
      <rect x="22" y="30" width="14" height="10" rx="1.5" />
      <rect x="30" y="21" width="7" height="9" rx="1.5" />
      <path d="M33 21 V10 l7 3 -7 3" />
      <path d="M12 40 h44" />
      <path d="M4 58 q4 -4 8 0 t8 0 t8 0 t8 0 t8 0 t8 0" strokeWidth="2" />
    </>
  ),
  football: (
    <>
      <circle cx="32" cy="32" r="23" />
      <path d="M32 21 L42 28 L38 40 H26 L22 28 Z" />
      <path d="M32 21 V9 M42 28 L53 24 M38 40 L46 50 M26 40 L18 50 M22 28 L11 24" />
    </>
  ),
  hockey: (
    <>
      <path d="M18 6 L33 44 q3 8 -4 9 h-8 q-5 0 -4 -5" />
      <path d="M46 6 L31 44" />
      <path d="M31 44 q-2 9 5 9 h7 q5 0 4 -5" />
      <circle cx="52" cy="57" r="3.5" />
    </>
  ),
  trophy: (
    <>
      <path d="M22 9 h20 v13 c0 10 -4 15 -10 15 c-6 0 -10 -5 -10 -15 Z" />
      <path d="M22 13 c-9 0 -9 12 0 12 M42 13 c9 0 9 12 0 12" />
      <path d="M32 37 v7 M26 48 h12 M22 55 h20" />
      <path d="M29 17 l3 -4 3 4" strokeWidth="2" />
    </>
  ),
  globe: (
    <>
      <circle cx="32" cy="32" r="23" />
      <ellipse cx="32" cy="32" rx="10" ry="23" />
      <path d="M9 32 h46" />
      <path d="M13 20 q19 8 38 0 M13 44 q19 -8 38 0" />
    </>
  ),
  paperplane: (
    <>
      <path d="M8 30 L57 11 L37 53 L30 37 Z" />
      <path d="M57 11 L30 37" />
      <path d="M6 42 h9 M10 50 h7" strokeDasharray="3 4" />
    </>
  ),
  eiffel: (
    <>
      <path d="M32 6 c2 14 8 32 21 49 M32 6 c-2 14 -8 32 -21 49" />
      <path d="M23 33 h18 M16 45 h32" />
      <path d="M23 55 q9 -12 18 0" />
      <path d="M11 55 h42" />
    </>
  ),
  indiagate: (
    <>
      <path d="M17 56 V27 c0 -8 6 -13 15 -13 c9 0 15 5 15 13 v29" />
      <path d="M25 56 V36 q7 -9 14 0 v20" />
      <path d="M13 14 h38 M15 8 h34" />
      <path d="M12 56 h40" />
      <path d="M30 3 h4" />
    </>
  ),
  flag: (
    <>
      <path d="M15 4 V60" />
      <path d="M15 8 H51 V36 H15" />
      <path d="M15 17 H51 M15 27 H51" strokeWidth="2" />
      <circle cx="33" cy="22" r="3" />
      <path d="M11 60 h8" />
    </>
  ),
  chakra: (
    <>
      <circle cx="32" cy="32" r="21" />
      <circle cx="32" cy="32" r="3" />
      <path d="M32 11 v10 M32 43 v10 M11 32 h10 M43 32 h10 M17 17 l7 7 M40 40 l7 7 M47 17 l-7 7 M24 40 l-7 7" />
    </>
  ),
  laptop: (
    <>
      <rect x="16" y="12" width="32" height="22" rx="2" />
      <path d="M10 46 L16 34 h32 l6 12 z" />
      <path d="M25 46 h14" />
    </>
  ),
  robot: (
    <>
      <rect x="18" y="24" width="28" height="22" rx="3" />
      <circle cx="27" cy="34" r="2.5" />
      <circle cx="37" cy="34" r="2.5" />
      <path d="M27 41 h10" />
      <path d="M32 24 v-6" />
      <circle cx="32" cy="15" r="2" />
      <path d="M18 32 h-5 M46 32 h5" />
    </>
  ),
  chip: (
    <>
      <rect x="20" y="20" width="24" height="24" rx="2" />
      <rect x="28" y="28" width="8" height="8" />
      <path d="M26 20 v-6 M32 20 v-6 M38 20 v-6" />
      <path d="M26 44 v6 M32 44 v6 M38 44 v6" />
      <path d="M20 26 h-6 M20 32 h-6 M20 38 h-6" />
      <path d="M44 26 h6 M44 32 h6 M44 38 h6" />
    </>
  ),
  chartup: (
    <>
      <path d="M12 50 h44 M12 50 v-40" />
      <path d="M17 44 L27 33 L35 39 L49 18" />
      <path d="M43 18 L49 18 L49 24" />
    </>
  ),
  bars: (
    <>
      <path d="M10 52 h46" />
      <rect x="15" y="38" width="8" height="14" />
      <rect x="28" y="28" width="8" height="24" />
      <rect x="41" y="16" width="8" height="36" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="32" cy="42" rx="15" ry="5" />
      <ellipse cx="32" cy="34" rx="15" ry="5" />
      <ellipse cx="32" cy="26" rx="15" ry="5" />
      <path d="M17 26 v16 M47 26 v16" />
    </>
  ),
};

export default function Sketch({
  name,
  className,
}: {
  name: SketchName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
