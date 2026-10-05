import { useState } from 'react';
import { FoodiePanel } from './FoodiePanel';

/**
 * "Ask Foodie AI" entry point.
 *
 * Visible but secondary, as specified: the city is the way in, and this is the
 * shortcut for someone who would rather describe a mood than walk a map.
 */
export function FoodieAIBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fc-ai-dock">
      <button
        type="button"
        className="fc-ai-button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="fc-ai-spark" aria-hidden="true">
          ✨
        </span>
        <span className="fc-ai-label">Ask Foodie AI</span>
        <span className="fc-ai-hint">&ldquo;something spicy and vegetarian&rdquo;</span>
      </button>

      {open ? <FoodiePanel onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
