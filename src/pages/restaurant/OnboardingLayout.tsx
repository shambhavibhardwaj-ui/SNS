import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Check, ChevronRight, FileText, HelpCircle } from 'lucide-react';
import { AccountButton } from '../../components/auth/AccountButton';
import { getDocumentKinds, getOverview, getSteps } from '../../services/onboardingService';
import { ReadyModal } from './ReadyModal';

/**
 * The onboarding shell.
 *
 * Deliberately *not* `DashboardShell`. Registration is a sequence with an end,
 * not a dashboard you return to, and the two layouts disagree about what the
 * left column is for: a dashboard rail is a set of places, this one is a set of
 * steps with an order and a state each. Running the flow inside the dashboard
 * meant two left columns listing the same five things, one of which could tell
 * you where you were and one of which could not.
 *
 * So: a plain top bar, the stepper rail, and the step's own content beside it.
 * Everything the owner needs to orient themselves is in that rail.
 */
const STEP_ROUTES: Record<string, string> = {
  details: '/partner/details',
  documents: '/partner/documents',
  delivery: '/partner/delivery',
  submit: '/partner/submit',
  review: '/partner',
};

export function OnboardingLayout() {
  const { pathname } = useLocation();
  const steps = getSteps();
  const overview = getOverview();
  const kinds = getDocumentKinds();

  const [docsOpen, setDocsOpen] = useState(false);
  /*
   * Shown once per browser, not once per visit.
   *
   * It is a checklist of things to go and find before starting — useful the
   * first time and an obstacle every time after. `localStorage` can throw in a
   * private window, so every access is guarded and the fallback is to show it.
   */
  const [ready, setReady] = useState(() => {
    try {
      return !localStorage.getItem('sns-onboarding-briefed');
    } catch {
      return true;
    }
  });

  const dismissReady = () => {
    setReady(false);
    try {
      localStorage.setItem('sns-onboarding-briefed', '1');
    } catch {
      /* A viewer who cannot store it sees it again. Harmless. */
    }
  };

  /* The first step that is not done — where "Continue" goes. */
  const next = steps.find((s) => s.state !== 'done') ?? steps[steps.length - 1];

  return (
    <div className="ob-shell">
      <header className="ob-topbar">
        <Link to="/restaurant" className="ob-logo">
          <span className="ob-logo-mark" aria-hidden="true" />
          <span>
            <strong>SNS</strong>
            <em>restaurant partner</em>
          </span>
        </Link>
        <AccountButton />
      </header>

      <div className="ob-layout">
        <aside className="ob-rail">
          <nav className="ob-rail-card" aria-label="Registration steps">
            <h2>Complete your registration</h2>

            <ol className="ob-vsteps">
              {steps.map((s, i) => {
                const to = STEP_ROUTES[s.id];
                const here = pathname === to;
                return (
                  <li key={s.id} data-state={s.state} data-here={here || undefined}>
                    <NavLink to={to} end className="ob-vstep">
                      <span className="ob-vstep-mark" aria-hidden="true">
                        {s.state === 'done' ? <Check size={15} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="ob-vstep-body">
                        <strong>{s.label}</strong>
                        <em>{s.hint}</em>
                      </span>
                      <span className="fc-sr-only">
                        {s.state === 'done' ? 'complete'
                          : s.state === 'current' ? 'in progress' : 'not started'}
                      </span>
                    </NavLink>

                    {/* The one call to action, on the step you are up to. */}
                    {s.id === next.id && !here ? (
                      <Link to={to} className="ob-continue">
                        Continue
                        <ChevronRight size={15} strokeWidth={2.5} />
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ol>

            <div className="ob-rail-progress">
              <div
                className="ob-progress-track"
                role="meter"
                aria-valuenow={Math.round(overview.percent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Registration progress"
              >
                <span style={{ width: `${overview.percent}%` }} />
              </div>
              <p>{Math.round(overview.percent)}% complete</p>
            </div>
          </nav>

          {/* A disclosure, not a second page: it is a list to read once. */}
          <div className="ob-aside-card">
            <button
              type="button"
              className="ob-aside-head"
              aria-expanded={docsOpen}
              onClick={() => setDocsOpen((o) => !o)}
            >
              <FileText size={17} strokeWidth={2} aria-hidden="true" />
              <span>Documents required for registration</span>
              <ChevronRight size={16} strokeWidth={2.5} data-open={docsOpen || undefined} />
            </button>
            {docsOpen ? (
              <ul className="ob-aside-list">
                {kinds.map((k) => (
                  <li key={k.id}>
                    <Check size={13} strokeWidth={3} aria-hidden="true" />
                    <span>
                      {k.label}
                      {k.required ? null : <em className="ob-optional">optional</em>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="ob-aside-card ob-aside-help">
            <HelpCircle size={17} strokeWidth={2} aria-hidden="true" />
            <span>Stuck on something? The platform team reviews every application by hand.</span>
          </div>
        </aside>

        <main className="ob-main">
          <Outlet />
        </main>
      </div>

      {ready ? <ReadyModal kinds={kinds} onClose={dismissReady} /> : null}
    </div>
  );
}
