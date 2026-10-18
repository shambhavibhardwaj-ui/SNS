import { useEffect, useRef, useState } from 'react';

/**
 * A background food video, with an honest fallback.
 *
 * **There is no stock footage in this project, on purpose.** A photographic
 * video sat behind the city for a few commits and was taken out again because
 * its licence was never settled — `src/assets/ATTRIBUTION.md` records that, and
 * that nothing third-party is left. So this component does not ship a video: it
 * plays one if a file is present at `src` and renders an original drawn
 * fallback when there is not.
 *
 * That is not a placeholder in the sense of something broken. A missing file
 * produces a composed gradient-and-grain panel in the house palette, and the
 * page reads as finished either way — which is the only version of this that
 * can be committed without an asset licence attached to it.
 *
 * Autoplay rules: muted and `playsInline` or iOS refuses outright, and a
 * rejected `play()` is caught rather than thrown — a browser declining to
 * autoplay is a policy, not an error.
 */
export function FoodVideo({
  src, poster, className, tone = 'teal',
}: {
  /** A file under `public/video/`. Absent is a supported state. */
  src?: string;
  poster?: string;
  className?: string;
  tone?: 'teal' | 'warm' | 'plum';
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    const node = ref.current;
    if (!node || !src) return;

    /*
     * Play while on screen, pause while not.
     *
     * A looping video behind a section nobody is looking at is decode work for
     * nothing — on a laptop it is the difference between a warm fan and a
     * quiet one.
     *
     * **On-screen is measured, not remembered.** An earlier version latched an
     * `isIntersecting` flag from the observer and had `visibilitychange` check
     * it before retrying. That deadlocks: a document that is hidden reports
     * every element as not intersecting, so the flag goes false and the video
     * pauses — and when the tab is brought forward, the retry reads the stale
     * false and refuses to play. Nothing clears it until something scrolls.
     * The symptom is a hero that sits on a still frame after you switch to a
     * tab you opened in the background, which is an ordinary way to open a
     * link.
     *
     * So `onScreen()` asks the geometry each time. The observer still drives
     * the common case; it just no longer owns the only copy of the answer.
     */
    const onScreen = () => {
      const r = node.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      const w = window.innerWidth || document.documentElement.clientWidth;
      return r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;
    };

    /*
     * No `document.hidden` guard, deliberately. Some embedding contexts report
     * `hidden` while plainly on screen — the desktop app's browser pane does,
     * which is the same trap `ui/cloud-sky` documents — and the guard then
     * refuses to start a video the person is looking at. Browsers already
     * throttle media in genuinely backgrounded tabs.
     */
    const tryPlay = () => {
      if (onScreen()) void node.play().catch(() => undefined);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
        /* Only pause on a real scroll-away, not because the document went
           hidden and the observer reported everything as off screen. */
        else if (!document.hidden && !onScreen()) node.pause();
      },
      { threshold: 0.01 },
    );
    io.observe(node);

    /*
     * Retry, rather than assuming the first play() took.
     *
     * A browser can refuse autoplay for reasons that stop applying: a
     * background tab, a window not yet interacted with, an element that was
     * not ready when the observer first fired. One rejected promise otherwise
     * leaves the hero on a still frame for the rest of the session.
     */
    node.addEventListener('canplay', tryPlay);
    document.addEventListener('visibilitychange', tryPlay);
    return () => {
      io.disconnect();
      node.removeEventListener('canplay', tryPlay);
      document.removeEventListener('visibilitychange', tryPlay);
    };
  }, [src]);

  if (failed) {
    return <div className={['lp-video-fallback', className].filter(Boolean).join(' ')} data-tone={tone} aria-hidden="true" />;
  }

  return (
    <video
      ref={ref}
      className={['lp-video', className].filter(Boolean).join(' ')}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      onError={() => setFailed(true)}
    />
  );
}
