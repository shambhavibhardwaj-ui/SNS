import {
  Expand, Maximize2, Minus, Plus, RotateCcw, RotateCw, Undo2,
} from 'lucide-react';
import type { ViewName } from './CameraRig';

const VIEW_LABELS: { key: ViewName; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'explore', label: 'Explore' },
  { key: 'top', label: 'Top' },
  { key: 'front', label: 'Front' },
  { key: 'side', label: 'Side' },
];

/**
 * Camera controls, as ordinary HTML over the canvas.
 *
 * Buttons rather than in-scene gizmos: these need to be reachable by keyboard
 * and readable by a screen reader, and a mesh is neither. They sit in the same
 * navy-and-butter chrome as the rest of the city so the panel belongs to the
 * page rather than to the renderer.
 */
export function CityControls({
  onView, onOrbit, onZoom, onReset, onFullscreen,
}: {
  onView: (v: ViewName) => void;
  /** -1 anticlockwise, +1 clockwise. */
  onOrbit: (dir: number) => void;
  /** <1 zooms in, >1 zooms out. */
  onZoom: (factor: number) => void;
  onReset: () => void;
  onFullscreen: () => void;
}) {
  return (
    <div className="c3-controls">
      <div className="c3-views" role="group" aria-label="Camera presets">
        {VIEW_LABELS.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => onView(key)}>
            {label}
          </button>
        ))}
      </div>

      <div className="c3-pad" role="group" aria-label="Camera controls">
        <button type="button" onClick={() => onOrbit(-1)} title="Rotate left" aria-label="Rotate left">
          <RotateCcw size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => onOrbit(1)} title="Rotate right" aria-label="Rotate right">
          <RotateCw size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => onZoom(0.8)} title="Zoom in" aria-label="Zoom in">
          <Plus size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => onZoom(1.25)} title="Zoom out" aria-label="Zoom out">
          <Minus size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => onView('top')} title="Look from above" aria-label="Look from above">
          <Maximize2 size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={onReset} title="Reset view" aria-label="Reset view">
          <Undo2 size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={onFullscreen} title="Fullscreen" aria-label="Fullscreen">
          <Expand size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
