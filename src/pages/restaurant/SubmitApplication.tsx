import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, Send } from 'lucide-react';
import { DELIVERY_MODEL_LABEL } from '../../data/admin/types';
import {
  getApplication, getDocuments, getReadiness, submitApplication,
} from '../../services/onboardingService';
import { PageHead, Panel } from './PageHead';

/**
 * Step four: send it.
 *
 * Everything on one page, because an admin is about to read it on one page and
 * the owner should see what they are sending. The button is disabled when the
 * application is not ready — but `submitApplication()` checks again on the
 * service side, since a disabled button is a hint and not a rule.
 */
export function SubmitApplication() {
  const app = getApplication();
  const readiness = getReadiness();
  const docs = getDocuments();
  const [sent, setSent] = useState(Boolean(app.submittedAt));
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    const result = submitApplication();
    if (!result.ok) {
      setError(result.reason ?? 'The application could not be submitted.');
      return;
    }
    setError(null);
    setSent(true);
  };

  if (sent) {
    return (
      <>
        <PageHead title="Submitted" />
        <Panel>
          <div className="ob-sent">
            <span className="ob-sent-mark" aria-hidden="true"><Check size={26} strokeWidth={3} /></span>
            <h3>Application submitted</h3>
            <p>
              Sent on {app.submittedAt}. The platform team reads it and comes back with one of
              three answers: approved, returned for changes, or rejected with a reason.
            </p>
            <p className="ob-sent-note">
              You will see the decision on your overview, and any document they return will show
              there with the reason attached. Nothing more is needed from you now.
            </p>
            <Link to="/restaurant" className="ob-save">See your application status</Link>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Review and submit"
        lede="This is exactly what the platform team will see."
      />

      {readiness.blockers.length ? (
        <div className="ob-blockers">
          <p className="ob-blockers-head">
            <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
            <strong>Not ready yet.</strong> {readiness.blockers.length}
            {readiness.blockers.length === 1 ? ' thing is' : ' things are'} outstanding.
          </p>
          <ul>
            {readiness.blockers.map((b) => (
              <li key={b.id}>
                <Link to={b.href}>{b.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Panel title="Restaurant information">
        <dl className="ar-facts">
            <div><dt>Restaurant</dt><dd>{app.restaurantName || <Blank />}</dd></div>
            <div><dt>Owner</dt><dd>{app.ownerName || <Blank />}</dd></div>
            <div><dt>Phone</dt><dd>{app.phone || <Blank />}</dd></div>
            <div><dt>Email</dt><dd>{app.email || <Blank />}</dd></div>
            <div><dt>Address</dt><dd>{app.address || <Blank />}</dd></div>
            <div><dt>Location</dt><dd>{app.locality || <Blank />}</dd></div>
            <div><dt>Type</dt><dd>{app.restaurantType ?? <Blank />}</dd></div>
          <div><dt>Hours</dt><dd>{app.operatingHours || <Blank />}</dd></div>
        </dl>
      </Panel>

      <Panel title="Restaurant setup">
        <dl className="ar-facts">
            <div>
              <dt>Cuisines</dt>
              <dd>
                {app.cuisines.length ? (
                  <span className="ap-cuisines">
                    {app.cuisines.map((c) => <span key={c} className="ap-cuisine">{c}</span>)}
                  </span>
                ) : <Blank />}
                <span className="ar-hint">Each cuisine gets its own menu.</span>
              </dd>
            </div>
            <div>
              <dt>Delivery method</dt>
              <dd>
                {app.deliveryModel ? DELIVERY_MODEL_LABEL[app.deliveryModel] : <Blank />}
                <span className="ar-hint">Sets which fee structure applies.</span>
              </dd>
            </div>
          <div><dt>Description</dt><dd>{app.description || <span className="dt-notset">Not provided</span>}</dd></div>
        </dl>
      </Panel>

      <Panel title="Documents">
        <ul className="ob-doc-summary">
            {docs.map((d) => (
              <li key={d.kindId} data-state={d.state.toLowerCase().replace(/\s+/g, '-')}>
                <span>{d.kind.label}</span>
                <span className="ob-doc-state" data-state={d.state.toLowerCase().replace(/\s+/g, '-')}>
                  {d.state === 'Uploaded' ? 'Awaiting review'
                    : d.state === 'Missing' ? (d.kind.required ? 'Not uploaded' : 'Not provided')
                      : d.state}
                </span>
              </li>
          ))}
        </ul>
      </Panel>

      {error ? <p className="lg-error">{error}</p> : null}

      <div className="ob-submit-row">
          <button
            type="button"
            className="ob-submit"
            onClick={send}
            disabled={!readiness.canSubmit}
            title={readiness.canSubmit ? undefined : 'Finish the outstanding items first'}
          >
            <Send size={15} strokeWidth={2} />
            Submit application
          </button>
        <p className="ob-note">
          Once submitted you cannot edit it until the team responds. Documents already verified
          stay verified.
        </p>
      </div>
    </>
  );
}

function Blank() {
  return <span className="dt-notset">Not filled in</span>;
}
