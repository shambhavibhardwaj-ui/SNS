/**
 * authService — the only place the UI touches identity or roles.
 *
 * Authentication ("who is this?") is Supabase Auth. Authorisation ("what may
 * they reach?") is the `role` column on `profiles`, which the browser cannot
 * write — see supabase/migrations/0001_profiles_and_roles.sql.
 *
 * The role returned here is a *convenience for rendering*, not a security
 * boundary. Hiding the admin dashboard is a courtesy; what actually stops a
 * customer reading admin data is row level security on the server. Treat every
 * role check in the client as cosmetic.
 */
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, requireSupabase, supabase } from './supabaseClient';

export type AppRole = 'customer' | 'admin' | 'delivery';

/** Mirrors the `profiles` table. */
export interface Profile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: AppRole;
  createdAt: string;
}

export type AuthStatus = 'loading' | 'signed-out' | 'signed-in' | 'unconfigured';

/** Friendly text for the things that actually go wrong. */
export class AuthError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'AuthError';
  }
}

export function isAuthConfigured(): boolean {
  return isSupabaseConfigured();
}

/** Where each role lands after signing in. */
export const HOME_FOR_ROLE: Record<AppRole, string> = {
  customer: '/customer',
  admin: '/admin',
  delivery: '/delivery',
};

export function homeForRole(role: AppRole | null | undefined): string {
  return role ? HOME_FOR_ROLE[role] : '/login';
}

/* --------------------------------------------------------------- session -- */

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new AuthError('Could not read your session. Try reloading the page.', error);
  return data.session;
}

/** Fires whenever Supabase signs in, signs out or refreshes the token. */
export function onAuthChange(handler: (session: Session | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => handler(session));
  return () => data.subscription.unsubscribe();
}

/* ------------------------------------------------------------- profiles -- */

interface ProfileRow {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name?.trim() || (row.email ?? 'Guest').split('@')[0],
    email: row.email ?? '',
    avatarUrl: row.avatar_url,
    role: row.role,
    createdAt: row.created_at,
  };
}

/**
 * Read the signed-in user's profile.
 *
 * A trigger creates the profile the moment the auth user is inserted, so the
 * row is normally there already. It can be missing for a moment right after a
 * first sign-in, which is why this retries briefly rather than reporting a
 * broken account.
 */
export async function fetchProfile(user: User, attempt = 0): Promise<Profile> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('id, user_id, name, email, avatar_url, role, created_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new AuthError('We could not load your account. Please try again in a moment.', error);
  }

  if (!data) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
      return fetchProfile(user, attempt + 1);
    }
    throw new AuthError(
      'Your account has no profile yet. If this keeps happening, the database setup step has not been run.',
    );
  }

  return toProfile(data as ProfileRow);
}

/** Update the fields a person is allowed to change about themselves. */
export async function updateOwnProfile(
  userId: string,
  patch: { name?: string; avatarUrl?: string | null },
): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from('profiles')
    .update({ name: patch.name, avatar_url: patch.avatarUrl })
    .eq('user_id', userId);
  if (error) throw new AuthError('That change could not be saved.', error);
}

/* ------------------------------------------------------------- sign in -- */

/**
 * Start the Google sign-in redirect.
 *
 * Supabase handles the OAuth exchange and verifies the token server-side, which
 * is the part a browser-only implementation cannot do.
 */
export async function signInWithGoogle(redirectTo: string = window.location.origin): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) {
    throw new AuthError('Google sign-in could not be started. Please try again.', error);
  }
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new AuthError('Sign out did not complete. Please try again.', error);
}

/**
 * Turn whatever Supabase threw into something worth showing a person.
 * OAuth failures arrive as query or hash parameters on the redirect back.
 */
export function readOAuthError(search: string, hash: string): string | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const code = params.get('error') ?? hashParams.get('error');
  if (!code) return null;

  const description =
    params.get('error_description') ?? hashParams.get('error_description') ?? '';

  if (code === 'access_denied') return 'Sign-in was cancelled. Nothing has changed.';
  if (description.toLowerCase().includes('expired')) {
    return 'That sign-in link expired. Please try again.';
  }
  return 'Google sign-in did not complete. Please try again.';
}
