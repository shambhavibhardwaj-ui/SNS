import { homeForRole, type AppRole, type AuthStatus } from '../services/authService';

export type RouteDecision =
  | { kind: 'wait' }
  | { kind: 'render' }
  | { kind: 'redirect'; to: string; remember: boolean };

/**
 * What a guarded route should do, given who is asking.
 *
 * Pulled out as a pure function so every combination can be tested directly
 * rather than only through a live session. It decides what to *render* — the
 * real access control is row level security on the server.
 */
export function routeDecision(
  status: AuthStatus,
  role: AppRole | null,
  allow: AppRole[],
): RouteDecision {
  /* Still reading the session: showing anything now would flash the wrong screen. */
  if (status === 'loading') return { kind: 'wait' };

  /* Nothing to authenticate against — the login screen explains the setup. */
  if (status === 'unconfigured') return { kind: 'redirect', to: '/login', remember: false };

  /* Send them to sign in, and remember where they were going. */
  if (status === 'signed-out') return { kind: 'redirect', to: '/login', remember: true };

  /* Signed in but no profile: the account is unusable, so back to login. */
  if (!role) return { kind: 'redirect', to: '/login', remember: false };

  /* Signed in with the wrong role: their own home, never a dead end. */
  if (!allow.includes(role)) return { kind: 'redirect', to: homeForRole(role), remember: false };

  return { kind: 'render' };
}
