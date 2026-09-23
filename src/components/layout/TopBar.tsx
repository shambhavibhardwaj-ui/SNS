/**
 * Landing-page chrome.
 *
 * Search and the profile control are deliberately inert in this build — search
 * lands in its own step, and there is no auth yet. They are marked
 * `aria-disabled` rather than faked so the demo never implies working features.
 */
export function TopBar() {
  return (
    <header className="fc-topbar">
      <a className="fc-brand" href="#top">
        <svg className="fc-brand-mark" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="19" fill="#C4543F" />
          <path d="M8 26 L14 16 L20 23 L26 12 L32 26 Z" fill="#F6DCA9" />
          <rect x="8" y="26" width="24" height="4" rx="2" fill="#E8A33D" />
          <circle cx="26" cy="11" r="3" fill="#E8A33D" />
        </svg>
        <span className="fc-brand-text">
          <span className="fc-brand-name">Food City</span>
          <span className="fc-brand-sub">RestaurantOnboarding</span>
        </span>
      </a>

      <div className="fc-search" aria-disabled="true" title="Search arrives in a later step">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10.5 10.5 L14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Search restaurants, cuisines, dishes"
          aria-label="Search restaurants, cuisines and dishes — not yet available"
          disabled
        />
      </div>

      <button
        type="button"
        className="fc-profile"
        aria-disabled="true"
        title="Accounts arrive in a later step"
      >
        <span className="fc-profile-avatar" aria-hidden="true">
          🧑‍🍳
        </span>
        <span>Guest</span>
      </button>
    </header>
  );
}
