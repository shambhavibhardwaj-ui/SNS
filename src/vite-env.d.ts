/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Google OAuth 2.0 Web client ID.
   *
   * Public by design — it ships in the bundle. The client *secret* must never
   * appear in this project; it belongs only to server-side flows.
   */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
