import { Check } from 'lucide-react';
import type { StageStep } from '../../services/onboardingService';

/**
 * The five stages, across the top of every onboarding screen.
 *
 * It is the same component on each page so the owner always knows where they
 * are without reading anything — the one orientation device the brief asks for
 * repeatedly. States come from the service; this draws them and nothing more.
 *
 * An ordered list, not a row of divs: the steps genuinely are a sequence, and
 * a screen reader should hear it as one.
 */
export function StageSteps({ steps }: { steps: StageStep[] }) {
  return (
    <ol className="ob-steps">
      {steps.map((s, i) => (
        <li key={s.id} data-state={s.state}>
          <span className="ob-step-mark" aria-hidden="true">
            {s.state === 'done' ? <Check size={13} strokeWidth={3} /> : i + 1}
          </span>
          <span className="ob-step-body">
            <strong>{s.label}</strong>
            <em>{s.hint}</em>
          </span>
          {/* The state in words, for anyone not seeing the colour. */}
          <span className="fc-sr-only">
            {s.state === 'done' ? 'complete' : s.state === 'current' ? 'in progress' : 'not started'}
          </span>
        </li>
      ))}
    </ol>
  );
}
