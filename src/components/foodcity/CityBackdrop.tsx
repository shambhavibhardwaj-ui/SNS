import { useCallback, useEffect, useRef, useState } from 'react';
import hillsVideo from '../../assets/material-hills.mp4';

/**
 * The landscape behind the city.
 *
 * The still is a CSS background on `.fc-backdrop` and always paints, so first
 * frame is instant and there is something there if the video never arrives.
 * The loop layers over it and fades in once it can actually play.
 *
 * It is not rendered at all — so not downloaded at all — for someone who has
 * asked for less motion, or on a narrow screen, where two megabytes of
 * scenery is a poor trade against someone's data. `display: none` would have
 * hidden it and downloaded it anyway.
 */
export function CityBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [wantsVideo, setWantsVideo] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const roomy = window.matchMedia('(min-width: 900px)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setWantsVideo(roomy.matches && !calm.matches);
    update();

    roomy.addEventListener('change', update);
    calm.addEventListener('change', update);
    return () => {
      roomy.removeEventListener('change', update);
      calm.removeEventListener('change', update);
    };
  }, []);

  /*
   * Start it, and say so only if it actually started.
   *
   * Autoplay can be refused outright — a browser setting, a data saver — and a
   * refused video sits on its first frame looking like a still that has gone
   * wrong. Better to leave it transparent and let the real still show through.
   */
  const start = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video
      .play()
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, []);

  /*
   * Browsers suspend background video in a hidden tab and do not resume it on
   * return, so without this the landscape is frozen from the first time
   * someone switches away.
   */
  useEffect(() => {
    if (!wantsVideo) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') start();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [wantsVideo, start]);

  return (
    <div className="fc-backdrop" aria-hidden="true">
      {wantsVideo ? (
        <video
          ref={videoRef}
          className="fc-backdrop-video"
          data-ready={ready || undefined}
          src={hillsVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={start}
          onPlaying={() => setReady(true)}
        />
      ) : null}

      {/* Sits over the loop and takes its hue, the same way the gradient over
          the still does — so the hills move without leaving the palette. */}
      <span className="fc-backdrop-tint" />
    </div>
  );
}
