import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Bike, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { homeForRole } from '../services/authService';
import { RouteSpinner } from '../auth/RequireRole';

const ROLES = [
  {
    key: 'customer',
    Icon: UserRound,
    title: 'Customer',
    blurb: 'Explore the city and order food.',
    note: 'Created automatically when you sign in.',
  },
  {
    key: 'admin',
    Icon: ShieldCheck,
    title: 'Admin',
    blurb: 'Manage restaurants, orders and fees.',
    note: 'Granted by an existing admin.',
  },
  {
    key: 'delivery',
    Icon: Bike,
    title: 'Delivery',
    blurb: 'Pick up and complete deliveries.',
    note: 'Provisioned by an admin.',
  },
] as const;

/**
 * Sign-in screen.
 *
 * The three roles are shown so people understand the platform, but they are
 * captions, not choices — there is no control here that grants a role. Your
 * role is read from the database after Google has confirmed who you are, which
 * is the only order that cannot be gamed.
 */
type Method = 'google' | 'email';

export function LoginPage() {
  const { status, role, error, clearError, signInWithGoogle, signInWithPassword, signUpWithPassword } =
    useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<Method>('google');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [notice, setNotice] = useState<string | null>(null);

  if (status === 'loading') return <RouteSpinner />;
  if (status === 'signed-in' && role) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? homeForRole(role)} replace />;
  }

  const onSignIn = async () => {
    setBusy(true);
    clearError();
    await signInWithGoogle();
    /* On success the browser leaves for Google, so this only runs on failure. */
    setBusy(false);
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    clearError();
    try {
      if (mode === 'signup') {
        const needsConfirmation = await signUpWithPassword(form.email, form.password, form.name);
        setNotice(
          needsConfirmation
            ? 'Account created. Check your inbox to confirm the address before signing in.'
            : 'Account created — signing you in.',
        );
      } else {
        await signInWithPassword(form.email, form.password);
      }
    } catch {
      /* The provider has already put a readable message on `error`. */
    } finally {
      setBusy(false);
    }
  };

  const field = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <main className="lg-page">
      <div className="lg-art" aria-hidden="true">
        <LoginSkyline />
      </div>

      <div className="lg-panel">
        <div className="lg-card">
          <div className="lg-brand">
            <svg className="lg-mark" viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="19" fill="#C2455E" />
              <path d="M8 26 L14 16 L20 23 L26 12 L32 26 Z" fill="#FFF8B5" />
              <rect x="8" y="26" width="24" height="4" rx="2" fill="#F0DE79" />
              <circle cx="26" cy="11" r="3" fill="#FFF8B5" />
            </svg>
            <span>Food City</span>
          </div>

          <h1 className="lg-title">Welcome to Food City</h1>
          <p className="lg-sub">
            Explore the city. Discover restaurants. Order what you love.
          </p>

          {status === 'unconfigured' ? (
            <SetupNotice />
          ) : (
            <>
              <div className="lg-methods" role="tablist" aria-label="Sign-in method">
                <button
                  type="button"
                  role="tab"
                  aria-selected={method === 'google'}
                  onClick={() => setMethod('google')}
                >
                  <GoogleMark />
                  Google
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={method === 'email'}
                  onClick={() => setMethod('email')}
                >
                  <Mail size={15} strokeWidth={2} />
                  Email
                </button>
              </div>

              {method === 'google' ? (
                <>
                  <button type="button" className="lg-google" onClick={onSignIn} disabled={busy}>
                    <GoogleMark />
                    {busy ? 'Opening Google…' : 'Continue with Google'}
                  </button>
                  <p className="lg-nopass">
                    No password to create — we use your Google account.
                  </p>
                </>
              ) : (
                <form className="lg-form" onSubmit={onEmailSubmit}>
                  {mode === 'signup' ? (
                    <label>
                      <span>Name</span>
                      <input
                        type="text"
                        value={form.name}
                        onChange={field('name')}
                        autoComplete="name"
                        required
                      />
                    </label>
                  ) : null}

                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={field('email')}
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label>
                    <span>Password</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={field('password')}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      minLength={6}
                      required
                    />
                  </label>

                  <button type="submit" className="lg-submit" disabled={busy}>
                    {busy
                      ? 'Working…'
                      : mode === 'signup'
                        ? 'Create account'
                        : 'Sign in'}
                  </button>

                  <p className="lg-switch">
                    {mode === 'signup' ? 'Already have an account?' : 'No account yet?'}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signup' ? 'signin' : 'signup');
                        setNotice(null);
                        clearError();
                      }}
                    >
                      {mode === 'signup' ? 'Sign in' : 'Create one'}
                    </button>
                  </p>
                </form>
              )}
            </>
          )}

          {error ? (
            <p className="lg-error" role="alert">
              {error}
            </p>
          ) : null}

          {notice ? (
            <p className="lg-notice" role="status">
              {notice}
            </p>
          ) : null}

          <div className="lg-roles">
            <p className="lg-roles-head">
              <Lock size={12} strokeWidth={2.4} aria-hidden="true" />
              Roles are assigned, not chosen
            </p>
            <ul>
              {ROLES.map(({ key, Icon, title, blurb, note }) => (
                <li key={key}>
                  <span className="lg-role-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span className="lg-role-body">
                    <span className="lg-role-title">{title}</span>
                    <span className="lg-role-blurb">{blurb}</span>
                    <span className="lg-role-note">{note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="lg-roles-foot">
              These are not options to pick, and it makes no difference whether you sign in with
              Google or a password. Signing in creates a <strong>customer</strong> account unless
              the database already says otherwise.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

function SetupNotice() {
  return (
    <div className="lg-setup" role="note">
      <p className="lg-setup-title">Sign-in is not connected yet</p>
      <p>
        Create a Supabase project, enable the Google provider under Authentication, run
        <code> supabase/migrations/0001_profiles_and_roles.sql</code>, then add the project URL
        and publishable key to <code>.env.local</code>:
      </p>
      <pre>{'VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=your-publishable-key'}</pre>
      <p className="lg-setup-note">
        Both are public and safe here. The service-role key is not — it bypasses row level
        security and belongs only to a server.
      </p>
    </div>
  );
}

/** A slice of the city skyline, so the sign-in screen belongs to the product. */
function LoginSkyline() {
  return (
    <svg viewBox="0 0 520 420" preserveAspectRatio="xMidYMid slice" className="lg-skyline">
      <defs>
        <linearGradient id="lg-sky" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#0E8480" />
          <stop offset="60%" stopColor="#0A6A66" />
          <stop offset="100%" stopColor="#04302F" />
        </linearGradient>
      </defs>
      <rect width="520" height="420" fill="url(#lg-sky)" />
      {[
        { x: 60, y: 250, w: 92, h: 120, roof: '#FCA5D1', wall: '#FFF1F4' },
        { x: 168, y: 210, w: 104, h: 160, roof: '#C2643F', wall: '#FAF0DC' },
        { x: 288, y: 246, w: 88, h: 124, roof: '#04302F', wall: '#F7EDDC' },
        { x: 392, y: 226, w: 96, h: 144, roof: '#0A6A66', wall: '#F1F5F2' },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={4} fill={b.wall} opacity={0.94} />
          <path d={`M ${b.x - 9} ${b.y} L ${b.x + b.w / 2} ${b.y - 30} L ${b.x + b.w + 9} ${b.y} Z`} fill={b.roof} />
          {[0, 1].map((r) =>
            [0, 1].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={b.x + 16 + c * (b.w - 52)}
                y={b.y + 26 + r * 40}
                width={24}
                height={22}
                rx={3}
                fill="#FFF8B5"
                opacity={(i + r + c) % 3 === 0 ? 0.95 : 0.42}
              />
            )),
          )}
        </g>
      ))}
      <rect x={0} y={370} width={520} height={50} fill="#04302F" opacity={0.5} />
      {[40, 130, 240, 350, 460].map((x) => (
        <circle key={x} cx={x} cy={392} r={4} fill="#FFF8B5" opacity={0.5} />
      ))}
    </svg>
  );
}
