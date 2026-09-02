import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True once the public Supabase env vars are set (Vercel + .env.local). */
export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Read-only public client (anon key, RLS-guarded). Server-side use. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!url || !anonKey) {
      throw new Error("Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY)");
    }
    client = createClient(url, anonKey, {
      auth: { persistSession: false },
      // Never let Next.js cache the DB reads — editions get backfilled/recompiled,
      // so a stale Data Cache would show wrong sections. Always read live.
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    });
  }
  return client;
}
