/**
 * The footer.
 *
 * No social links: the brief asked for them only if real URLs exist, and this
 * project has no accounts anywhere. Four honest links beat six with two dead
 * ones. About and Contact scroll back up the page rather than claiming pages
 * that are not built.
 */
export function LandingFooter({ onAbout }: { onAbout: () => void }) {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-brand">
        <strong>SNS</strong>
        <span>Restaurant onboarding &amp; food discovery</span>
      </div>
      <nav className="lp-footer-links" aria-label="Footer">
        <button type="button" onClick={onAbout}>About</button>
        <a href="mailto:hello@sns.example">Contact</a>
        <span aria-hidden="true">·</span>
        <span className="lp-footer-note">
          A class project. Privacy policy and terms are not written yet.
        </span>
      </nav>
    </footer>
  );
}
