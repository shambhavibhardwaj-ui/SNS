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
      window.clearTimeout(watchdog);
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
     *
     * **The work is deferred out of the callback, and that is load-bearing.**
     * supabase-js holds its auth lock while it emits this event, and
     * `apply()` queries `profiles` — a request that needs the same lock to
     * attach the session. Called straight from the handler it waits for a lock
     * the handler is still holding, so the promise never settles: `status`
     * stays `loading` and the app spins forever after a Google round trip,
     * rather than failing with something a person could read. Supabase's own
     * guidance is not to call Supabase from inside this callback; a zero
     * timeout is the documented way out, because it lets the emit finish and
     * the lock release first.
     */
    /*
     * A watchdog, because a spinner that never resolves is the worst of the
     * failure modes — it gives a person nothing to read and nothing to do.
     *
     * Only fires while the status is still `loading`, so a session that
     * arrives late simply cancels it. Eight seconds is well past a slow
     * profile read and well short of the patience of someone who has just
     * come back from Google.
     */
    const watchdog = window.setTimeout(() => {
      if (!alive) return;
      setStatus((s) => {
        if (s !== 'loading') return s;
        setError('Signing in took too long. Please try again.');
        return 'signed-out';
      });
    }, 8000);

    const timers = new Set<number>();
    const unsubscribe = onAuthChange((session) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        void apply(session);
      }, 0);
      timers.add(t);
    });

    return () => {
      alive = false;
      window.clearTimeout(watchdog);
      for (const t of timers) window.clearTimeout(t);
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
