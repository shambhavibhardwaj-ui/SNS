import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { formatCount, formatPercent } from './format';
import type { FunnelStage } from '../../services/analyticsService';

/**
 * A stage funnel.
 *
 * Each bar's width is its share of the *first* stage, which is what makes the
 * taper mean something — widths proportional to the largest stage would look
 * identical for any set of numbers that happen to descend.
 *
 * Both percentages come from the service, computed from the counts beside
 * them, so a stage and its conversion can never disagree.
 */
export function Funnel({
  stages,
  exits,
  countLabel = 'restaurants',
}: {
  stages: FunnelStage[];
  exits?: { id: string; label: string; count: number; href: string }[];
  countLabel?: string;
}) {
  return (
    <div className="an-funnel">
      <ol className="an-funnel-stages">
        {stages.map((s, i) => {
          const body = (
            <>
              <span className="an-funnel-bar" style={{ width: `${Math.min(100, Math.max(12, s.percentOfTop))}%` }} />
              <span className="an-funnel-text">
                <span className="an-funnel-label">{s.label}</span>
                {s.hint ? <span className="an-funnel-hint">{s.hint}</span> : null}
              </span>
              <span className="an-funnel-figures">
                <strong>{formatCount(s.count)}</strong>
                <span className="an-funnel-pct">
                  {s.conversionFromPrevious === null
                    ? `${formatPercent(100, 0)} of intake`
                    : `${formatPercent(s.conversionFromPrevious)} of previous`}
                </span>
              </span>
            </>
          );

          return (
            <li key={s.id} className="an-funnel-stage">
              {s.href ? (
                <Link to={s.href} className="an-funnel-row" title={`Open ${s.label}`}>
                  {body}
                </Link>
              ) : (
                <div className="an-funnel-row is-static">{body}</div>
              )}
              {i < stages.length - 1 ? (
                <ChevronDown className="an-funnel-arrow" size={15} aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {exits?.length ? (
        <div className="an-funnel-exits">
          <p className="an-funnel-exits-head">Left the funnel</p>
          <ul>
            {exits.map((e) => (
              <li key={e.id}>
                <Link to={e.href}>
                  <span>{e.label}</span>
                  <strong>{formatCount(e.count)}</strong>
                </Link>
              </li>
            ))}
          </ul>
          <p className="an-funnel-exits-note">
            Counted separately: these {countLabel} did not continue to the next stage.
          </p>
        </div>
      ) : null}
    </div>
  );
}
