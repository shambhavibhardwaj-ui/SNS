import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { StatusPill } from '../dashboard/DataTable';
import { formatCount, formatPercent } from '../analytics/format';
import { DELIVERY_MODEL_LABEL } from '../../data/admin/types';
import {
  BASE_MONTHLY_SALARY, getPartnerCompletionRate, isSalaryEligible,
  type DeliveryPartner,
} from '../../services/deliveryService';

/**
 * One delivery partner, in full.
 *
 * This exists so the table does not have to carry it. A rider's phone number,
 * email and insurance policy id are the kind of thing that should take a
 * deliberate click to see rather than sitting in a row that anyone glancing at
 * the admin's screen can read — so the table shows what you sort and scan by,
 * and the identifying detail lives behind this.
 *
 * Modelled on `ApplicationReview`: same scrim, same dialog shell, same
 * escape-to-close, so the two detail views in the admin behave identically.
 * Read-only for now — the actions along the foot are where the Supabase
 * mutations will attach.
 */
export function DeliveryPartnerDetail({
  partner,
  onClose,
}: {
  partner: DeliveryPartner;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { insurance } = partner;
  const eligible = isSalaryEligible(partner);

  return (
    <div className="au-scrim" onClick={onClose} role="presentation">
      <div
        className="ar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dp-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ar-head">
          <div>
            <p className="ar-eyebrow">
              <span className="dt-mono">{partner.id}</span>
              <StatusPill value={partner.status} />
            </p>
            <h2 id="dp-title">{partner.name}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="au-close"
            onClick={onClose}
            aria-label="Close delivery partner"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="ar-body">
          <section>
            <h3>Personal information</h3>
            <dl className="ar-facts">
              <div><dt>Name</dt><dd>{partner.name}</dd></div>
              <div><dt>Partner ID</dt><dd><span className="dt-mono">{partner.id}</span></dd></div>
              <div><dt>Email</dt><dd><span className="dt-mono">{partner.email}</span></dd></div>
              <div><dt>Phone</dt><dd><span className="dt-mono">{partner.phone}</span></dd></div>
              <div><dt>Joining date</dt><dd>{partner.joinedAt}</dd></div>
            </dl>
          </section>

          <section>
            <h3>Work information</h3>
            <dl className="ar-facts">
              <div><dt>Current status</dt><dd><StatusPill value={partner.status} /></dd></div>
              <div>
                <dt>Works under</dt>
                <dd>
                  {partner.provider}
                  <span className="ar-hint">{DELIVERY_MODEL_LABEL[partner.deliveryModel]}</span>
                </dd>
              </div>
              <div><dt>Orders assigned</dt><dd>{formatCount(partner.ordersAssigned)}</dd></div>
              <div>
                <dt>Orders completed</dt>
                <dd>
                  {formatCount(partner.ordersCompleted)}
                  <span className="ar-hint">
                    {formatPercent(getPartnerCompletionRate(partner))} completion rate
                  </span>
                </dd>
              </div>
              <div><dt>Cancelled orders</dt><dd>{formatCount(partner.ordersCancelled)}</dd></div>
              <div><dt>Average delivery time</dt><dd>{partner.averageMinutes.toFixed(1)} min</dd></div>
              <div>
                <dt>Customer rating</dt>
                <dd>
                  <span className="dt-rating" data-low={partner.rating < 3 || undefined}>
                    ★ {partner.rating.toFixed(1)}
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3>Salary</h3>
            <dl className="ar-facts">
              <div>
                <dt>Base salary</dt>
                <dd>
                  ₹{BASE_MONTHLY_SALARY.toLocaleString('en-IN')}/month
                  <span className="ar-hint">The same flat rate for every partner.</span>
                </dd>
              </div>
              <div>
                <dt>On the monthly bill</dt>
                <dd>
                  {eligible ? 'Yes' : 'No'}
                  {eligible ? null : (
                    <span className="ar-hint">Inactive partners are not paid.</span>
                  )}
                </dd>
              </div>
              <div><dt>Payment status</dt><dd><StatusPill value={partner.paymentStatus} /></dd></div>
              <div><dt>Last payment</dt><dd>{partner.lastPaidOn}</dd></div>
            </dl>
          </section>

          <section>
            <h3>Insurance</h3>
            {insurance.status === 'Pending' ? (
              <p className="ar-prior">
                Cover has been applied for and no policy has been issued yet, so there is no
                provider, policy number or coverage window to show.
              </p>
            ) : null}
            <dl className="ar-facts">
              <div><dt>Status</dt><dd><StatusPill value={insurance.status} /></dd></div>
              <div><dt>Provider</dt><dd>{insurance.provider ?? '—'}</dd></div>
              <div>
                <dt>Policy ID</dt>
                <dd>{insurance.policyId ? <span className="dt-mono">{insurance.policyId}</span> : '—'}</dd>
              </div>
              <div><dt>Coverage start</dt><dd>{insurance.coverageStart ?? '—'}</dd></div>
              <div><dt>Coverage end</dt><dd>{insurance.coverageEnd ?? '—'}</dd></div>
            </dl>
          </section>
        </div>

        <footer className="ar-foot">
          {/* Where the Supabase mutations attach. Disabled rather than absent,
              so the shape of what an admin will be able to do is visible. */}
          <span className="dt-actions">
            {['Edit partner', 'Change status', 'Assigned orders', 'Delivery history'].map((l) => (
              <button key={l} type="button" className="dt-action" aria-disabled="true" title="Not wired up yet">
                {l}
              </button>
            ))}
          </span>
          <button type="button" className="ar-cancel" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}
