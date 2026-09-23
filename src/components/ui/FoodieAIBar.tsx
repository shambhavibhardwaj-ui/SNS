/**
 * "Ask Foodie AI" entry point.
 *
 * Visible but secondary, as specified. The panel behind it — and the grounded
 * recommendation service that only ever cites real menu rows — is a later step;
 * this is the docked launcher it will open from.
 */
export function FoodieAIBar() {
  return (
    <div className="fc-ai-dock">
      <button
        type="button"
        className="fc-ai-button"
        aria-disabled="true"
        title="Foodie AI arrives in a later step"
      >
        <span className="fc-ai-spark" aria-hidden="true">
          ✨
        </span>
        <span className="fc-ai-label">Ask Foodie AI</span>
        <span className="fc-ai-hint">&ldquo;something spicy and vegetarian&rdquo;</span>
      </button>
    </div>
  );
}
