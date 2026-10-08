import type { CameraApiRef } from '../scene/cameraApi';
import { GridIcon, HomeIcon, MinusIcon, PlusIcon, RotateLeftIcon, RotateRightIcon } from './icons';

interface Props {
  api: CameraApiRef;
  showGrid: boolean;
  onToggleGrid(): void;
  className?: string;
}

const QUARTER = Math.PI / 4;

/** Vertical button strip at the scene edge, as in the style reference. */
export function CameraControls({ api, showGrid, onToggleGrid, className = '' }: Props) {
  return (
    <div className={`camera-controls card ${className}`} role="toolbar" aria-label="Camera">
      <button title="Zoom in" onClick={() => api.current?.zoom(0.7)}><PlusIcon /></button>
      <button title="Zoom out" onClick={() => api.current?.zoom(1 / 0.7)}><MinusIcon /></button>
      <span className="divider" />
      <button title="Rotate left" onClick={() => api.current?.rotate(-QUARTER)}><RotateLeftIcon /></button>
      <button title="Rotate right" onClick={() => api.current?.rotate(QUARTER)}><RotateRightIcon /></button>
      <button title="Home view" onClick={() => api.current?.home()}><HomeIcon /></button>
      <span className="divider" />
      <button
        title={showGrid ? 'Hide 10 m grid' : 'Show 10 m grid'}
        aria-pressed={showGrid}
        className={showGrid ? 'active' : ''}
        onClick={onToggleGrid}
      >
        <GridIcon />
      </button>
    </div>
  );
}
