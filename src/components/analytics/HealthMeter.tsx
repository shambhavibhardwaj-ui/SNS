import { formatPercent } from './format';
import type { HealthIndicator } from '../../services/analyticsService';

/**
 * Platform health.
 *
 * Every row states what its percentage is a ratio of. A bare "82%" invites an
 * admin to ask "of what?" and get no answer, which is how a dashboard number
 * becomes decoration. Tone is three steps, not a gradient — a continuous
 * colour scale implies a precision these ratios do not have.
 */
export function HealthMeter({ indicators }: { indicators: HealthIndicator[] }) {
  return (
    <ul className="an-health">
      {indicators.map((h) => (
        <li key={h.id} className="an-health-row" data-tone={h.tone}>
          <div className="an-health-head">
            <span className="an-health-label">{h.label}</span>
            <strong className="an-health-value">{formatPercent(h.percent)}</strong>
          </div>
          <div
            className="an-health-track"
            role="meter"
            aria-valuenow={Math.round(h.percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${h.label}: ${h.basis}`}
          >
            <span className="an-health-fill" style={{ width: `${h.percent}%` }} />
          </div>
          <p className="an-health-basis">{h.basis}</p>
        </li>
      ))}
    </ul>
  );
}
