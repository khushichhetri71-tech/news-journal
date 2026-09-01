"use client";

import Script from "next/script";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Loads GA4 (only if NEXT_PUBLIC_GA_ID is set) and turns any element with a
// data-ga="event_name" attribute into a tracked click. Extra data-ga-* attrs
// become event params, e.g. data-ga-section="sports" → { section: "sports" }.
export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement)?.closest?.("[data-ga]");
      if (!el) return;
      const name = el.getAttribute("data-ga");
      if (!name) return;
      const params: Record<string, string> = {};
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith("data-ga-")) {
          params[attr.name.slice(8).replace(/-/g, "_")] = attr.value;
        }
      }
      track(name, params);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
