import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  AuthError,
  fetchProfile,
  isAuthConfigured,
  onAuthChange,
  readOAuthError,
  signInWithGoogle as startGoogleSignIn,
  signInWithPassword as passwordSignIn,
  signUpWithPassword as passwordSignUp,
  signOut as endSession,
  type AuthStatus,
  type Profile,
} from '../services/authService';
import { AuthContext, type AuthContextValue } from './authContext';

/**
 * Holds the session and the profile behind it.
 *
 * Two separate things: Supabase tells us *who* signed in, and the `profiles`
 * row tells us *what they may reach*. The profile is re-read on every auth
 * change rather than cached across sessions, so a role revoked in the database
 * takes effect on the next sign-in instead of lingering in the browser.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isAuthConfigured();
  const [status, setStatus] = useState<AuthStatus>(configured ? 'loading' : 'unconfigured');
  const [profile, setProfile] = useState<Profile | null>(null);
  /*
   * An OAuth failure comes back on the URL rather than as a thrown error, so it
   * is read once as the initial value instead of set from an effect.
   */
  const [error, setError] = useState<string | null>(() =>
    readOAuthError(window.location.search, window.location.hash),
  );

  /* Tidy the failure out of the address bar; nothing re-renders from this. */
  useEffect(() => {
    if (window.location.search.includes('error') || window.location.hash.includes('error')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    let alive = true;

    const apply = async (session: Session | null) => {
      if (!alive) return;
      if (!session?.user) {
        setProfile(null);
        setStatus('signed-out');
        return;
      }
      try {
        const next = await fetchProfile(session.user);
        if (!alive) return;
        setProfile(next);
        setStatus('signed-in');
      } catch (e) {
        if (!alive) return;
        /* Signed in but unusable — say so rather than looping on a blank screen. */
        setError(e instanceof AuthError ? e.message : 'We could not load your account.');
        setProfile(null);
        setStatus('signed-out');
      }
    };

    /*
     * onAuthStateChange fires immediately with the restored session, so it
     * covers the initial read as well as later sign-in and sign-out.
     */
    const unsubscribe = onAuthChange((session) => {
      void apply(session);
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [configured]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await startGoogleSignIn(`${window.location.origin}/login`);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Sign-in could not be started.');
    }
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await passwordSignIn(email, password);
    } catch (e) {
      const message = e instanceof AuthError ? e.message : 'Sign-in failed.';
      setError(message);
      throw e;
    }
  }, []);

  const signUpWithPassword = useCallback(
    async (email: string, password: string, name: string) => {
      setError(null);
      try {
        const { needsConfirmation } = await passwordSignUp(email, password, name);
        return needsConfirmation;
      } catch (e) {
        const message = e instanceof AuthError ? e.message : 'That account could not be created.';
        setError(message);
        throw e;
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await endSession();
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Sign out did not complete.');
    } finally {
      /* Drop every role-dependent value, not just the token. */
      setProfile(null);
      setStatus(configured ? 'signed-out' : 'unconfigured');
    }
  }, [configured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      profile,
      role: profile?.role ?? null,
      error,
      clearError: () => setError(null),
      signInWithGoogle,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [status, profile, error, signInWithGoogle, signInWithPassword, signUpWithPassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
