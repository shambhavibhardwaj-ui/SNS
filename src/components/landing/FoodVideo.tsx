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

    /* Pause while off screen. A looping video behind a section nobody is
       looking at is decode work for nothing, and on a laptop it is the
       difference between a warm fan and a quiet one. */
    let visible = false;
    /*
     * No `document.hidden` guard here, deliberately.
     *
     * It looks like a sensible optimisation and it is a bug: some embedding
     * contexts report `hidden` while plainly on screen — the desktop app's
     * browser pane does, which is the same trap `ui/cloud-sky` documents — and
     * the guard then refuses to start a video the person is looking at.
     * Browsers already throttle media in genuinely backgrounded tabs; this does
     * not need to second-guess them.
     */
    const tryPlay = () => {
      if (visible) void node.play().catch(() => undefined);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) tryPlay();
        else node.pause();
      },
      { threshold: 0.01 },
    );
    io.observe(node);

    /*
     * Retry, rather than assuming the first play() took.
     *
     * A browser can refuse autoplay for reasons that stop applying: a
     * background tab, a window that has not been interacted with, a video
     * element that was not ready when the observer first fired. One rejected
     * promise left the hero on a still frame for the rest of the session, so
     * the attempt is repeated when the element becomes playable and when the
     * page becomes visible again.
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
