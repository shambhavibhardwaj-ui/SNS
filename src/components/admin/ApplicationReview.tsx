import { useEffect, useRef, useState } from 'react';
import { Check, Clock, FileEdit, X } from 'lucide-react';
import {
  DELIVERY_MODEL_LABEL,
  type ApplicationStatus,
  type RestaurantApplication,
} from '../../data/admin/types';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { getDocuments } from '../../services/onboardingService';
import { OWNER_APPLICATION_ID } from '../../services/applicationQueue';

type Decision = 'Approved' | 'Rejected' | 'Needs Changes' | 'Under Review';

const DECISIONS: { value: Decision; label: string; Icon: typeof Check; needsReason: boolean }[] = [
  { value: 'Approved', label: 'Approve', Icon: Check, needsReason: false },
  { value: 'Under Review', label: 'Move to Under Review', Icon: Clock, needsReason: false },
  { value: 'Needs Changes', label: 'Request Changes', Icon: FileEdit, needsReason: true },
  { value: 'Rejected', label: 'Reject', Icon: X, needsReason: true },
];

/**
 * Application detail and decision.
 *
 * Rejecting or requesting changes requires a reason — the applicant has to be
 * told what to fix, and a decision with no recorded cause is not reviewable
 * later. Approving does not.
 *
 * Decisions are local for now; this is where the Supabase update will go.
 */
export function ApplicationReview({
  application,
  onClose,
  onDecide,
}: {
  application: RestaurantApplication;
  onClose: () => void;
  onDecide: (id: string, status: ApplicationStatus, reason?: string) => void;
}) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const chosen = DECISIONS.find((d) => d.value === decision);
  const reasonMissing = Boolean(chosen?.needsReason) && reason.trim().length === 0;

  const submit = () => {
    if (!decision) return;
    setTouched(true);
    if (reasonMissing) return;
    onDecide(application.id, decision, reason.trim() || undefined);
  };

  return (
    <div className="au-scrim" onClick={onClose} role="presentation">
      <div
        className="ar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ar-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ar-head">
          <div>
            <p className="ar-eyebrow">
              <span className="dt-mono">{application.id}</span>
              <ApplicationStatusBadge status={application.status} />
            </p>
            <h2 id="ar-title">{application.restaurantName}</h2>
          </div>
          <button ref={closeRef} type="button" className="au-close" onClick={onClose} aria-label="Close application">
            <X size={17} strokeWidth={2.2} />
          </button>
        </header>

        <div className="ar-body">
          <section>
            <h3>Restaurant information</h3>
            <dl className="ar-facts">
              <div><dt>Restaurant</dt><dd>{application.restaurantName}</dd></div>
              <div><dt>Owner</dt><dd>{application.ownerName}</dd></div>
              <div><dt>Phone</dt><dd>{application.phone}</dd></div>
              <div><dt>Email</dt><dd>{application.email}</dd></div>
              <div><dt>Address</dt><dd>{application.address}</dd></div>
            </dl>
          </section>

          <section>
            <h3>Business information</h3>
            <dl className="ar-facts">
              <div>
                <dt>Cuisines</dt>
                <dd>
                  <span className="ap-cuisines">
                    {application.cuisines.map((c) => (
                      <span key={c} className="ap-cuisine">{c}</span>
                    ))}
                  </span>
                  <span className="ar-hint">Each cuisine gets its own menu.</span>
                </dd>
              </div>
              <div><dt>Description</dt><dd>{application.description}</dd></div>
              <div><dt>Operating hours</dt><dd>{application.operatingHours}</dd></div>
              <div>
                <dt>Delivery model</dt>
                <dd>
                  <strong>{DELIVERY_MODEL_LABEL[application.deliveryModel]}</strong>
                  <span className="ar-hint">
                    Determines which service fee structure applies. The rates themselves are not
                    set — the client has not provided them.
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          {/*
            Documents, on the same page as everything else.

            The brief is explicit that an admin should not hunt through five
            pages to understand one application, and documents were the part
            that was missing. Read-only here: verifying a document is its own
            decision with its own audit trail, and folding it into the
            approve/reject control would let one click accept five documents
            nobody opened.
          */}
          <section>
            <h3>Documents</h3>
            {/*
              Only the application that came through the restaurant dashboard
              has real documents behind it. The seed rows are fixtures with no
              owner, and showing one owner's paperwork under another
              applicant's name is worse than showing none.
            */}
            {application.id === OWNER_APPLICATION_ID ? (
            <ul className="ar-docs">
              {getDocuments().map((d) => (
                <li key={d.kindId}>
                  <span className="ar-doc-name">
                    {d.kind.label}
                    {d.kind.required ? null : <em className="ob-optional">optional</em>}
                  </span>
                  {d.fileName ? (
                    <span className="dt-mono ar-doc-file">{d.fileName}</span>
                  ) : (
                    <span className="dt-notset">No file</span>
                  )}
                  <span
                    className="ob-doc-state"
                    data-state={d.state.toLowerCase().replace(/\s+/g, '-')}
                  >
                    {d.state === 'Uploaded' ? 'Awaiting review'
                      : d.state === 'Missing' ? (d.kind.required ? 'Not uploaded' : 'Not provided')
                        : d.state}
                  </span>
                </li>
              ))}
            </ul>
            ) : (
              <p className="dt-empty">
                This application predates the restaurant dashboard, so it carries no uploaded
                documents. Applications submitted through it arrive with their checklist.
              </p>
            )}
            <p className="ar-hint">
              Verifying a document is a separate action from deciding the application, so it is
              not wired to the buttons below.
            </p>
          </section>

          {application.reviewNote ? (
            <p className="ar-prior">
              <strong>Previous note:</strong> {application.reviewNote}
            </p>
          ) : null}

          <section>
            <h3>Decision</h3>
            <div className="ar-decisions">
              {DECISIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  className="ar-decision"
                  aria-pressed={decision === value}
                  onClick={() => setDecision(value)}
                >
                  <Icon size={15} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>

            {chosen?.needsReason ? (
              <label className="ar-reason">
                <span>
                  Reason for {chosen.value === 'Rejected' ? 'rejection' : 'changes'}
                  <em> — sent to the applicant</em>
                </span>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="What needs to change, and why?"
                  aria-invalid={touched && reasonMissing}
                />
                {touched && reasonMissing ? (
                  <span className="ar-error" role="alert">
                    A reason is required before this can be sent.
                  </span>
                ) : null}
              </label>
            ) : null}
          </section>
        </div>

        <footer className="ar-foot">
          <button type="button" className="ar-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ar-submit" onClick={submit} disabled={!decision}>
            {chosen ? chosen.label : 'Choose a decision'}
          </button>
        </footer>
      </div>
    </div>
  );
}
