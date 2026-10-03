import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, Clock, FileCheck2, Truck, UtensilsCrossed,
} from 'lucide-react';
import { getApplication, getOverview, getTimeline } from '../../services/onboardingService';
import { PageHead, Panel } from './PageHead';

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
  const timeline = getTimeline();

  return (
    <>
      <PageHead
        title="Application status"
        lede="Where your registration stands, and everything that has happened to it."
      />

      {/*
        The answer, when there is one.

        Above everything else, because once an admin has decided it is the only
        thing on this page the owner came to read. The reason is printed in
        full for the same reason the document notes are — a verdict without one
        is the guessing this dashboard exists to end.
      */}
      {app.decision ? (
        <section className="ob-verdict" data-decision={app.decision.toLowerCase().replace(/\s+/g, '-')}>
          <span className="ob-verdict-mark" aria-hidden="true">
            {app.decision === 'Approved'
              ? <CheckCircle2 size={22} strokeWidth={2.4} />
              : <AlertTriangle size={22} strokeWidth={2.4} />}
          </span>
          <div>
            <h3>
              {app.decision === 'Approved' ? 'Your application was approved'
                : app.decision === 'Rejected' ? 'Your application was rejected'
                  : 'Changes were requested'}
            </h3>
            <p>
              {app.decision === 'Approved'
                ? `Decided ${app.decidedAt}. Your restaurant is on the platform — menus and orders come next.`
                : app.decision === 'Rejected'
                  ? `Decided ${app.decidedAt}.`
                  : `Reviewed ${app.decidedAt}. Fix the points below and submit again.`}
            </p>
            {app.decisionNote ? (
              <p className="ob-verdict-note">
                <strong>From the platform team:</strong> {app.decisionNote}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <Panel
        title={
          overview.submittedAt ? 'With the platform team'
            : overview.canSubmit ? 'Ready to submit'
              : 'Before you can submit'
        }
        lede={
          overview.submittedAt
            ? `Submitted ${overview.submittedAt}. Nothing is needed from you while they read it.`
            : overview.canSubmit
              ? 'Everything required is in. Sending it puts it in the platform team’s queue.'
              : `${overview.blockers.length} ${overview.blockers.length === 1 ? 'thing needs' : 'things need'} your attention. Each one links to where it is fixed.`
        }
        aside={
          <Link to="/restaurant/submit" className="ob-panel-link">
            {overview.submittedAt ? 'View what you sent'
              : overview.canSubmit ? 'Submit application' : 'Review and submit'}
          </Link>
        }
      >
        {overview.blockers.length ? (
          <ul className="ob-blocker-list">
            {overview.blockers.map((b) => (
              <li key={b.id}>
                <span className="ob-blocker-icon" aria-hidden="true">
                  <AlertTriangle size={15} strokeWidth={2.2} />
                </span>
                <span>{b.label}</span>
                <Link to={b.href}>Fix this</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ob-clear">
            <CheckCircle2 size={17} strokeWidth={2} aria-hidden="true" />
            Nothing outstanding.
          </p>
        )}
      </Panel>

      <ul className="ob-tally">
        <li><Clock size={15} strokeWidth={2.5} aria-hidden="true" /><strong>{overview.stage}</strong><span>stage</span></li>
        <li><UtensilsCrossed size={15} strokeWidth={2.5} aria-hidden="true" /><strong>{overview.cuisineCount}</strong><span>cuisines, each with its own menu</span></li>
        <li><Truck size={15} strokeWidth={2.5} aria-hidden="true" /><strong>{overview.deliveryLabel ?? 'Not chosen'}</strong><span>delivery</span></li>
        <li data-tone={overview.documents.needsReplacement ? 'bad' : 'good'}>
          <FileCheck2 size={15} strokeWidth={2.5} aria-hidden="true" />
          <strong>{overview.documents.verified} of {overview.documents.required}</strong>
          <span>documents verified</span>
        </li>
      </ul>

      {/* What has happened, newest first. */}
      <Panel title="History" lede="Everything that has happened to this application, and who did it.">
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
        <p className="ob-note">
          Mock data, shaped like the tables it becomes. The stage, the percentage and the list of
          blockers are all computed from the fields and documents on each read — none of them is
          stored, so none of them can disagree with the form.
        </p>
      </Panel>
    </>
  );
}
