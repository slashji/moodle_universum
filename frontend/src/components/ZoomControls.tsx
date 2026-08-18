import type { UniverseControls } from "./universe/UniverseCanvas";

interface ZoomControlsProps {
  controls: UniverseControls | null;
  zoomPercent: number;
}

export function ZoomControls({ controls, zoomPercent }: ZoomControlsProps) {
  return (
    <div className="zoom-controls">
      <button onClick={() => controls?.zoomIn()} aria-label="Zoom in">
        +
      </button>
      <div className="zoom-percent">{zoomPercent}%</div>
      <button onClick={() => controls?.zoomOut()} aria-label="Zoom out">
        −
      </button>
      <button className="zoom-reset" onClick={() => controls?.reset()} aria-label="Reset view">
        ⤾
      </button>
    </div>
  );
}
