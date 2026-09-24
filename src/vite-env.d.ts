/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://abcdefgh.supabase.co. Public. */
  readonly VITE_SUPABASE_URL?: string;
  /**
   * Supabase publishable (anon) key. Public by design — every request it makes
   * is still governed by row level security.
   *
   * The service-role key must NEVER be added here. It bypasses RLS, and
   * anything in a VITE_ variable ships to the browser.
   */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
