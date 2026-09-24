/**
 * authService — the only place the UI touches identity.
 *
 * Provider-agnostic on purpose. Today it is backed by Google Identity Services
 * directly, because the app has no backend yet. When Supabase lands, its
 * `signInWithOAuth` / `onAuthStateChange` replace the internals here and the
 * components do not change.
 *
 * The session is kept in localStorage, which is a demo-grade store: it is
 * readable by any script on the origin and trivially editable by the person
 * using the browser. That is acceptable while nothing depends on it. A real
 * session belongs in an httpOnly cookie issued by a server that has verified
 * the provider's token.
 */
import type { Customer } from '../data/types';
import {
  decodeIdToken,
  forgetGoogleAccount,
  isGoogleConfigured,
} from './providers/googleIdentity';

const SESSION_KEY = 'foodcity.session.v1';

export type AuthState =
  | { status: 'signed-out' }
  | { status: 'signed-in'; customer: Customer };

/** Whether an identity provider is configured at all. */
export function isAuthConfigured(): boolean {
  return isGoogleConfigured();
}

function readStorage(): Customer | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Customer;
    /* Ignore anything that is not shaped like a customer. */
    if (!parsed?.id || !parsed?.email) return null;
    return parsed;
  } catch {
    /* Private mode, blocked storage, or corrupt JSON — treat as signed out. */
    return null;
  }
}

function writeStorage(customer: Customer | null): void {
  try {
    if (customer) localStorage.setItem(SESSION_KEY, JSON.stringify(customer));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* Not fatal: the session simply will not survive a reload. */
  }
}

export function getSession(): AuthState {
  const customer = readStorage();
  return customer ? { status: 'signed-in', customer } : { status: 'signed-out' };
}

/**
 * Turn a Google ID token into a customer record.
 *
 * Throws when the token carries no usable identity. Note that the token is
 * decoded, not verified — see the security note in providers/googleIdentity.
 */
export function customerFromGoogleCredential(credential: string): Customer {
  const payload = decodeIdToken(credential);
  if (!payload.sub || !payload.email) {
    throw new Error('Google did not return an email for this account.');
  }
  if (payload.email_verified === false) {
    throw new Error('That Google account has an unverified email address.');
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    givenName: payload.given_name,
    avatarUrl: payload.picture,
    provider: 'google',
    createdAt: new Date().toISOString(),
  };
}

export function signIn(customer: Customer): AuthState {
  writeStorage(customer);
  return { status: 'signed-in', customer };
}

export function signOut(): AuthState {
  writeStorage(null);
  forgetGoogleAccount();
  return { status: 'signed-out' };
}
