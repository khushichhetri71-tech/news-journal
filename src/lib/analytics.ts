type Params = Record<string, string | number | undefined>;

/** Fire a GA4 event if analytics is loaded; a no-op otherwise. */
export function track(event: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof gtag === "function") gtag("event", event, params);
}
