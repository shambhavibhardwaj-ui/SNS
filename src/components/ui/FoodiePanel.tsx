import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Search, Sparkles, X } from 'lucide-react';
import { askFoodie, FOODIE_EXAMPLES, type FoodieAnswer } from '../../services/foodieService';

/**
 * Foodie AI, as a panel.
 *
 * Three things it deliberately does not do.
 *
 * It does not add anything to the cart. Every suggestion is a link to the dish
 * on its restaurant's page, where the person decides — the brief is explicit
 * that the AI layer never makes a decision, and "add all of these" would be
 * one. Nothing in this component imports the cart.
 *
 * It does not write prose. Each suggestion shows the reasons the service
 * matched, which are facts off the menu row. A friendly paragraph would be the
 * one part of the answer nobody could check.
 *
 * It does not hide what it understood. The parsed request is on screen, so a
 * person whose words were misread can see *that* rather than wonder why the
 * answers are strange.
 */
export function FoodiePanel({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<FoodieAnswer | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ask = async (q: string) => {
    const query = q.trim();
    if (!query) return;
    setText(query);
    setBusy(true);
    /* Awaited even though today's answer is synchronous: the component has to
       be written for the Edge Function call that replaces it. */
    const result = await askFoodie({ text: query });
    setAnswer(result);
    setBusy(false);
  };

  const understood = answer?.understood;
  const understoodParts = understood
    ? [
        understood.diet === 'veg' ? 'vegetarian' : understood.diet === 'non-veg' ? 'non-vegetarian' : null,
        understood.heat === 'spicy' ? 'spicy' : understood.heat === 'mild' ? 'mild' : null,
        understood.maxPrice !== null ? `under ₹${understood.maxPrice}` : null,
        understood.categories.length ? understood.categories.slice(0, 3).join(', ').toLowerCase() : null,
        understood.keywords.length ? `“${understood.keywords.join('”, “')}”` : null,
      ].filter(Boolean)
    : [];

  /*
   * Rendered into `document.body`.
   *
   * The launcher lives inside the city's sidebar, and the city canvas is a
   * transformed subtree — a transform makes `position: fixed` resolve against
   * that ancestor instead of the viewport, so the panel opened as a 230px
   * column squeezed inside the sidebar rather than over the page. A portal is
   * the fix that does not depend on knowing which ancestor did it.
   */
  return createPortal(
    <div className="au-scrim" onClick={onClose} role="presentation">
      <div
        className="fp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fp-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="fp-head">
          <div>
            <p className="fp-eyebrow">
              <Sparkles size={13} strokeWidth={2.4} aria-hidden="true" />
              Foodie AI
            </p>
            <h2 id="fp-title">What are you in the mood for?</h2>
          </div>
          <button type="button" className="au-close" onClick={onClose} aria-label="Close Foodie AI">
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <form
          className="fp-ask"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(text);
          }}
        >
          <Search size={17} strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="something spicy and vegetarian"
            aria-label="Describe what you feel like eating"
          />
          <button type="submit" disabled={busy || !text.trim()}>
            {busy ? <Loader2 size={15} className="fp-spin" aria-hidden="true" /> : 'Ask'}
          </button>
        </form>

        {/* Verified against the matcher, so none of them is a dead end. */}
        <div className="fp-examples">
          {FOODIE_EXAMPLES.map((e) => (
            <button key={e} type="button" onClick={() => void ask(e)}>{e}</button>
          ))}
        </div>

        <div className="fp-body">
          {!answer ? (
            <p className="fp-intro">
              Describe a mood, a budget or a restriction and it will find dishes that match.
              Everything it suggests is a real item from a kitchen that is open now — it cannot
              name a dish nobody cooks, and it never orders for you.
            </p>
          ) : (
            <>
              {understoodParts.length ? (
                <p className="fp-understood">
                  Looking for <strong>{understoodParts.join(' · ')}</strong>
                  <span>across {answer.considered} dishes on open menus</span>
                </p>
              ) : null}

              {answer.suggestions.length ? (
                <ul className="fp-results">
                  {answer.suggestions.map((s) => (
                    <li key={s.item.id}>
                      <div className="fp-result-main">
                        <p className="fp-result-name">
                          <strong>{s.item.name}</strong>
                          <span className="fp-price">₹{s.item.price}</span>
                        </p>
                        <p className="fp-result-where">
                          {s.restaurant.name} · {s.cuisine.name} · {s.district.name}
                        </p>
                        <p className="fp-result-desc">{s.item.description}</p>
                        <ul className="fp-reasons">
                          {s.reasons.map((r) => <li key={r}>{r}</li>)}
                        </ul>
                      </div>
                      {/* A link, not an add button: the person decides. */}
                      <Link
                        to={`restaurant/${s.restaurant.id}`}
                        className="fp-open"
                        onClick={onClose}
                      >
                        See it on the menu
                        <ArrowRight size={14} strokeWidth={2.2} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}

              {answer.unmet.length ? (
                <div className="fp-unmet">
                  {answer.unmet.map((u) => <p key={u}>{u}</p>)}
                </div>
              ) : null}
            </>
          )}
        </div>

        <footer className="fp-foot">
          Suggestions only, from menus as they are now. Foodie AI never places an order.
        </footer>
      </div>
    </div>,
    document.body,
  );
}
