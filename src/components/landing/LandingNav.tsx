import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { id: 'explore', label: 'Explore' },
  { id: 'cuisines', label: 'Discover cuisines' },
  { id: 'how', label: 'How it works' },
  { id: 'about', label: 'About' },
];

/**
 * The landing page's own header.
 *
 * Transparent over the hero and solid once the hero has scrolled past, because
 * pale nav text on a bright frame of the video is unreadable and a solid bar
 * over a cinematic opening is a worse first impression. The switch is a scroll
 * listener rather than an observer on the hero: it has to survive the hero
 * being replaced by its fallback panel, which is a different element.
 *
 * Not the city's `TopBar`. That one carries search, Home and the cart — state
 * that belongs to someone already inside the product. This is for a visitor who
 * has not arrived yet.
 */
export function LandingNav({ onSignIn }: { onSignIn: () => void }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="lp-nav" data-solid={solid || undefined} data-open={open || undefined}>
      <a className="lp-nav-brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="19" fill="#C4543F" />
          <path d="M8 26 L14 16 L20 23 L26 12 L32 26 Z" fill="#F6DCA9" />
          <rect x="8" y="26" width="24" height="4" rx="2" fill="#E8A33D" />
          <circle cx="26" cy="11" r="3" fill="#E8A33D" />
        </svg>
        <span>SNS</span>
      </a>

      <button
        type="button"
        className="lp-nav-burger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>

      <nav className="lp-nav-links" aria-label="Sections">
        {LINKS.map((l) => (
          <button key={l.id} type="button" onClick={() => go(l.id)}>{l.label}</button>
        ))}
        <button type="button" className="lp-nav-cta" onClick={() => { setOpen(false); onSignIn(); }}>
          Sign in
        </button>
      </nav>
    </header>
  );
}
