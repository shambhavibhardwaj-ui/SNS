import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, Clock, FileCheck2, Store, Truck, UtensilsCrossed,
} from 'lucide-react';
import { StatCards } from '../../components/dashboard/StatCard';
import { formatPercent } from '../../components/analytics/format';
import { getApplication, getOverview, getSteps, getTimeline } from '../../services/onboardingService';
import { StageSteps } from './StageSteps';

/**
 * Where the application stands, and what to do next.
 *
 * The brief's complaint was owners guessing. So the page leads with the one
 * thing they want to know — can I submit yet, and if not, why not — and the
 * "why not" is a list of specific, clickable blockers rather than a percentage
 * to interpret.
 */
export function OnboardingHome() {
  const app = getApplication();
  const overview = getOverview();
  const steps = getSteps();
  const timeline = getTimeline();

  return (
    <div className="dh ob">
      <StageSteps steps={steps} />

      {/* What is stopping submission, or that nothing is. */}
      <section className="dh-block is-primary">
        <div className="dh-block-head">
          <div>
            <h3>{overview.canSubmit ? 'Ready to submit' : 'Before you can submit'}</h3>
            <p className="dh-block-sub">
              {overview.canSubmit
                ? 'Everything required is in. Sending it puts it in the platform team’s queue.'
                : `${overview.blockers.length} ${overview.blockers.length === 1 ? 'thing needs' : 'things need'} your attention. Each one links to where it is fixed.`}
            </p>
          </div>
          <Link to="/restaurant/submit">
            {overview.canSubmit ? 'Submit application' : 'Review and submit'}
          </Link>
        </div>

        <div className="ob-progress">
          <div
            className="ob-progress-track"
            role="meter"
            aria-valuenow={Math.round(overview.percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Application completeness"
          >
            <span style={{ width: `${overview.percent}%` }} />
          </div>
          <p className="ob-progress-label">
            <strong>{formatPercent(overview.percent, 0)}</strong> complete ·
            {' '}open {overview.daysOpen} days
          </p>
        </div>

        {overview.blockers.length ? (
          <ul className="at-list">
            {overview.blockers.map((b) => (
              <li key={b.id} className="at-row">
                <span className="at-icon" aria-hidden="true">
                  <AlertTriangle size={17} strokeWidth={2} />
                </span>
                <span className="at-body"><strong>{b.label}</strong></span>
                <Link to={b.href} className="dt-action is-live">Fix this</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ob-clear">
            <CheckCircle2 size={17} strokeWidth={2} aria-hidden="true" />
            Nothing outstanding.
          </p>
        )}
      </section>

      <StatCards
        stats={[
          { label: 'Stage', value: overview.stage, hint: 'derived from what is filled in', Icon: Clock },
          { label: 'Cuisines', value: String(overview.cuisineCount), hint: 'each gets its own menu', Icon: UtensilsCrossed },
          { label: 'Delivery method', value: overview.deliveryLabel ?? 'Not chosen', hint: overview.deliveryLabel ? 'sets which fee applies' : 'required before submitting', Icon: Truck },
          { label: 'Documents verified', value: `${overview.documents.verified} of ${overview.documents.required}`, hint: `${overview.documents.needsReplacement} returned · ${overview.documents.missingRequired} not uploaded`, Icon: FileCheck2 },
        ]}
      />

      {/* Shortcuts, in the order the work happens. */}
      <section className="dh-block">
        <div className="dh-block-head"><h3>Your application</h3></div>
        <div className="ob-cards">
          <Link to="/restaurant/details" className="ob-card">
            <span className="ob-card-icon" aria-hidden="true"><Store size={18} strokeWidth={2} /></span>
            <strong>Restaurant details</strong>
            <span>{app.restaurantName || 'Not named yet'} · {app.locality || 'no location'}</span>
          </Link>
          <Link to="/restaurant/delivery" className="ob-card">
            <span className="ob-card-icon" aria-hidden="true"><Truck size={18} strokeWidth={2} /></span>
            <strong>Delivery method</strong>
            <span>{overview.deliveryLabel ?? 'Not chosen yet'}</span>
          </Link>
          <Link to="/restaurant/documents" className="ob-card">
            <span className="ob-card-icon" aria-hidden="true"><FileCheck2 size={18} strokeWidth={2} /></span>
            <strong>Documents</strong>
            <span>
              {overview.documents.verified} verified · {overview.documents.uploaded} awaiting review
            </span>
          </Link>
        </div>
      </section>

      {/* What has happened, newest first. */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>History</h3>
            <p className="dh-block-sub">
              Everything that has happened to this application, and who did it.
            </p>
          </div>
        </div>
        <ol className="ob-timeline">
          {timeline.map((e) => (
            <li key={e.id} data-actor={e.actor}>
              <span className="ob-tl-dot" aria-hidden="true" />
              <div className="ob-tl-body">
                <p className="ob-tl-head">
                  <strong>{e.label}</strong>
                  <span className="dt-mono">{e.at}</span>
                </p>
                {e.detail ? <p className="ob-tl-detail">{e.detail}</p> : null}
                <span className="ob-tl-actor" data-actor={e.actor}>
                  {e.actor === 'owner' ? 'You' : e.actor === 'admin' ? 'Platform team' : 'System'}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="dh-mock-note">
        Mock data, shaped like the tables it becomes. The stage, the percentage and the list of
        blockers are all computed from the fields and documents on each read — none of them is
        stored, so none of them can disagree with the form.
      </p>
    </div>
  );
}
