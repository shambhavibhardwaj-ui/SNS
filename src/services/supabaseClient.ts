/**
 * Supabase browser client.
 *
 * Only the *publishable* (anon) key belongs here. It is safe in the bundle
 * because every request it makes is still subject to row level security.
 *
 * The service-role key is the opposite: it bypasses RLS entirely. It must never
 * appear in this project — not in a component, not in a VITE_ variable, not in
 * any file the bundler can see. If you need it, you need a server.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return url.trim().length > 0 && anonKey.trim().length > 0;
}

/**
 * Null until the project is configured, so the app can still run and explain
 * itself rather than crashing on import.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Narrowing helper for the call sites that genuinely need a client. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.',
    );
  }
  return supabase;
}
