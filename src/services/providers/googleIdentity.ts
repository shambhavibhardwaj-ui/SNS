/**
 * Google Identity Services (GIS) provider.
 *
 * Loads Google's script, renders their official "Sign in with Google" button,
 * and turns the ID token it returns into a customer profile.
 *
 * SECURITY — read before extending this:
 *
 * 1. The OAuth *client ID* is public by design. It ships in the bundle and is
 *    visible to anyone; that is expected and fine.
 * 2. The OAuth *client secret* must never appear in this project. It is only
 *    used by server-side flows. If you ever find one here, it is leaked.
 * 3. This app has no backend, so the ID token is decoded but NOT signature
 *    verified. A decoded-but-unverified token is a claim, not proof — anyone
 *    can forge one by hand. It is fine for showing a name and avatar in a
 *    demo. Before it gates anything real (orders, payments, another person's
 *    data), the token must be verified server-side, either by Google's
 *    tokeninfo endpoint or by a library checking the signature, issuer,
 *    audience and expiry.
 */

const GIS_SRC = 'https://accounts.google.com/gsi/client';

export const googleClientId: string = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

export function isGoogleConfigured(): boolean {
  return googleClientId.trim().length > 0;
}

/** The subset of Google's ID token payload this app reads. */
export interface GoogleIdTokenPayload {
  /** Stable, unique subject id — this becomes customers.id. */
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  picture?: string;
  exp?: number;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: Record<string, string | number | undefined>,
  ): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let scriptPromise: Promise<void> | null = null;

/** Load Google's script once, no matter how many times sign-in is opened. */
export function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    const script = existing ?? document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => {
      scriptPromise = null;
      reject(new Error('Could not reach Google sign-in. Check the connection and try again.'));
    });
    if (!existing) document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Decode the ID token's payload.
 *
 * Decoding only — see the security note at the top of this file. The payload is
 * base64url and may contain non-ASCII names, so it is widened back to UTF-8
 * rather than read straight out of atob.
 */
export function decodeIdToken(credential: string): GoogleIdTokenPayload {
  const segment = credential.split('.')[1];
  if (!segment) throw new Error('Malformed sign-in response from Google.');

  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
  const utf8 = decodeURIComponent(
    binary
      .split('')
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );
  return JSON.parse(utf8) as GoogleIdTokenPayload;
}

/** Render Google's own button into `parent` and report the credential back. */
export async function renderGoogleButton(
  parent: HTMLElement,
  onCredential: (credential: string) => void,
  onError: (message: string) => void,
): Promise<void> {
  if (!isGoogleConfigured()) {
    onError('No Google client ID configured.');
    return;
  }

  await loadGoogleIdentity();
  const id = window.google?.accounts?.id;
  if (!id) {
    onError('Google sign-in did not load.');
    return;
  }

  id.initialize({
    client_id: googleClientId,
    callback: (response) => {
      if (response.credential) onCredential(response.credential);
      else onError('Google did not return a sign-in token.');
    },
    cancel_on_tap_outside: true,
  });

  parent.replaceChildren();
  id.renderButton(parent, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    logo_alignment: 'left',
    width: 280,
  });
}

/** Stop Google silently re-selecting the same account next visit. */
export function forgetGoogleAccount(): void {
  window.google?.accounts?.id?.disableAutoSelect();
}
