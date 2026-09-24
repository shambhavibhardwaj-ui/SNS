import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { AppRole } from '../services/authService';
import { routeDecision } from './routeDecision';
import { useAuth } from './useAuth';

/**
 * Route guard.
 *
 * This decides what to *render*, which is a usability concern, not a security
 * one: anyone can edit the bundle. The guarantee that a customer cannot read
 * admin data lives in row level security on the server. If a screen ever needs
 * to be genuinely restricted, the data behind it must be restricted too.
 *
 * Redirects follow one rule: send people to their own home rather than showing
 * a dead end.
 */
export function RequireRole({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { status, role } = useAuth();
  const location = useLocation();
  const decision = routeDecision(status, role, allow);

  if (decision.kind === 'wait') return <RouteSpinner />;

  if (decision.kind === 'redirect') {
    return (
      <Navigate
        to={decision.to}
        replace
        /* Remember where they were headed so sign-in can return them. */
        state={decision.remember ? { from: location.pathname } : undefined}
      />
    );
  }

  return <>{children}</>;
}

export function RouteSpinner() {
  return (
    <div className="au-route-wait" role="status" aria-live="polite">
      <span className="au-spinner" aria-hidden="true" />
      <p>Checking your account…</p>
    </div>
  );
}
