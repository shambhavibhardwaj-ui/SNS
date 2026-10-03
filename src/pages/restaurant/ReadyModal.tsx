import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import type { DocumentKind } from '../../data/onboarding';

/**
 * "Have these to hand before you start."
 *
 * The list is the real document checklist rather than a written copy of it, so
 * it cannot drift from the page it is describing — a modal promising five
 * documents in front of a form asking for six is worse than no modal.
 *
 * Shown once per browser. It is useful the first time and an obstacle every
 * time after, which is why it has one button and no second thought about it.
 */
export function ReadyModal({
  kinds,
  onClose,
}: {
  kinds: DocumentKind[];
  onClose: () => void;
}) {
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="au-scrim" role="presentation">
      <div className="ob-ready" role="dialog" aria-modal="true" aria-labelledby="ob-ready-title">
        {/* Original SVG, like everything else drawn in this project: a document
            and a phone, the two things the next ten minutes consist of. */}
        <div className="ob-ready-art" aria-hidden="true">
          <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid meet">
            <rect x="26" y="28" width="104" height="74" rx="8" className="ob-art-paper" />
            <rect x="38" y="42" width="30" height="30" rx="5" className="ob-art-photo" />
            <rect x="76" y="44" width="44" height="6" rx="3" className="ob-art-line" />
            <rect x="76" y="56" width="34" height="6" rx="3" className="ob-art-line" />
            <rect x="38" y="80" width="82" height="6" rx="3" className="ob-art-line" />
            <rect x="52" y="48" width="110" height="74" rx="8" className="ob-art-paper is-front" />
            <rect x="64" y="62" width="30" height="30" rx="5" className="ob-art-photo" />
            <rect x="102" y="64" width="48" height="6" rx="3" className="ob-art-line" />
            <rect x="102" y="76" width="36" height="6" rx="3" className="ob-art-line" />
            <rect x="64" y="100" width="86" height="6" rx="3" className="ob-art-line" />
            <rect x="196" y="18" width="76" height="118" rx="12" className="ob-art-phone" />
            <rect x="204" y="30" width="60" height="94" rx="7" className="ob-art-screen" />
            <rect x="212" y="42" width="44" height="5" rx="2.5" className="ob-art-line" />
            <rect x="212" y="54" width="32" height="5" rx="2.5" className="ob-art-line" />
            <rect x="212" y="66" width="40" height="5" rx="2.5" className="ob-art-line" />
            <g className="ob-art-badge">
              <rect x="172" y="84" width="96" height="30" rx="15" />
              <path d="M188 99 l5 5 l9 -10" className="ob-art-tick" />
              <text x="210" y="103">Verified</text>
            </g>
          </svg>
        </div>

        <h2 id="ob-ready-title">Have these ready for a smooth registration</h2>

        <ul className="ob-ready-list">
          {kinds.map((k) => (
            <li key={k.id}>
              <span className="ob-ready-tick" aria-hidden="true">
                <Check size={12} strokeWidth={3.5} />
              </span>
              <span>
                <strong>
                  {k.label}
                  {k.required ? null : <em className="ob-optional">optional</em>}
                </strong>
                <em>{k.hint}</em>
              </span>
            </li>
          ))}
        </ul>

        <button ref={okRef} type="button" className="ob-ready-ok" onClick={onClose}>
          Okay
        </button>
      </div>
    </div>
  );
}
