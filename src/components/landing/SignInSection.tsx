import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { FoodVideo } from './FoodVideo';
import { Reveal } from './Reveal';

/**
 * The last thing on the page: sign in, or go and look round first.
 *
 * **It is the real one.** `useAuth` is the same provider the `/login` screen
 * uses, so a successful sign-in produces a genuine Supabase session, the role
 * trigger assigns a role server-side, and `RoleHome` sends the person to the
 * home their role belongs to. Nothing here accepts an address and pretends.
 * When Supabase is not configured the form says so rather than failing
 * mysteriously — the one honest thing a disconnected login can do.
 *
 * The alternative matters as much as the form. Discovery is public in this
 * product on purpose, so "explore first" is a real route and not a teaser: it
 * opens the city, which needs no account. What it cannot do is reach anything
 * behind a role guard, and it does not pretend otherwise.
 */
export function SignInSection({ onExplore }: { onExplore: () => void }) {
  const { error, clearError, signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth();
  const configured = isSupabaseConfigured();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  /* Validated here rather than left to the browser: the native bubble is
     styled by the browser and lands outside this panel's own dark surface. */
  const emailBad = touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const passBad = touched && form.password.length < 6;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.password.length < 6) return;
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
    <section className="lp-signin" id="signin">
      <FoodVideo src="/video/kitchen-pass.mp4" className="lp-band-media" tone="plum" />
      <div className="lp-band-scrim" aria-hidden="true" />

      <Reveal className="lp-signin-inner">
        <div className="lp-signin-copy">
          <p className="lp-kicker">Come in</p>
          <h2>Ready to find your next favourite meal?</h2>
          <p className="lp-lede">Sign in to continue your food discovery journey.</p>
          <p className="lp-signin-alt">
            Want to explore first?{' '}
            <button type="button" onClick={onExplore}>Enter SNS</button>
            <span>The city is open to everyone — no account needed to wander it.</span>
          </p>
        </div>

        <div className="lp-panel">
          <div className="lp-panel-tabs" role="group" aria-label="Sign in or create an account">
            <button type="button" data-on={mode === 'signin' || undefined} onClick={() => setMode('signin')}>
              Sign in
            </button>
            <button type="button" data-on={mode === 'signup' || undefined} onClick={() => setMode('signup')}>
              Create account
            </button>
          </div>

          {!configured ? (
            <p className="lp-panel-warn">
              Sign-in is not connected yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code>, and the form below starts working — it is
              already wired to the real provider.
            </p>
          ) : null}

          <form className="lp-form" onSubmit={submit} noValidate>
            {mode === 'signup' ? (
              <label>
                <span>Name</span>
                <input type="text" value={form.name} onChange={field('name')} autoComplete="name" />
              </label>
            ) : null}

            <label>
              <span>Email address</span>
              <input
                type="email"
                value={form.email}
                onChange={field('email')}
                autoComplete="email"
                aria-invalid={emailBad || undefined}
                aria-describedby={emailBad ? 'lp-email-err' : undefined}
              />
              {emailBad ? <em id="lp-email-err">Enter a valid email address.</em> : null}
            </label>

            <label>
              <span>Password</span>
              <span className="lp-pass">
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={field('password')}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  aria-invalid={passBad || undefined}
                  aria-describedby={passBad ? 'lp-pass-err' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </span>
              {passBad ? <em id="lp-pass-err">At least six characters.</em> : null}
            </label>

            {error ? <p className="lp-form-error" role="alert">{error}</p> : null}
            {notice ? <p className="lp-form-notice" role="status">{notice}</p> : null}

            <button type="submit" className="lp-btn is-primary is-block" disabled={busy || !configured}>
              <LogIn size={15} strokeWidth={2.2} />
              {busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>

            <button
              type="button"
              className="lp-btn is-ghost is-block"
              disabled={busy || !configured}
              onClick={() => { clearError(); void signInWithGoogle(); }}
            >
              Continue with Google
            </button>

            {/*
              No password-reset screen exists yet, so this does not pretend to
              be one. Saying where the control will be is better than a link
              that goes nowhere.
            */}
            <p className="lp-form-foot">
              Forgot your password? Reset is not built yet — an admin can set a new one from
              the Supabase dashboard.
            </p>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
