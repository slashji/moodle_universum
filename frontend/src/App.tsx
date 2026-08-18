import { useEffect, useState } from "react";
import { UniverseCanvas, type UniverseControls } from "./components/universe/UniverseCanvas";
import type { ZoomLevel } from "./components/universe/NodeSprite";
import { TopBar } from "./components/TopBar";
import { HUD } from "./components/hud/HUD";
import { NodePanel } from "./components/panels/NodePanel";
import { Legend } from "./components/Legend";
import { ZoomControls } from "./components/ZoomControls";
import { useUniverseData } from "./hooks/useUniverseData";
import { useUniverseStore } from "./state/store";

export default function App() {
  const { status } = useUniverseData();
  const errorMessage = useUniverseStore((s) => s.errorMessage);
  const nodes = useUniverseStore((s) => s.nodes);
  const requestFlyTo = useUniverseStore((s) => s.requestFlyTo);

  const [controls, setControls] = useState<UniverseControls | null>(null);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("far");

  // Initial camera flight toward the student's most active course, once data is in.
  useEffect(() => {
    if (status !== "ready" || nodes.length === 0) return;
    const focusNode = [...nodes]
      .filter((n) => n.type === "course" && n.status === "in_progress")
      .sort((a, b) => (b.completion ?? 0) - (a.completion ?? 0))[0];
    if (!focusNode) return;
    const timer = setTimeout(() => requestFlyTo(focusNode.id), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "error") {
    return (
      <div className="app-shell app-shell-center">
        <div className="error-card">
          <h1>The universe failed to load</h1>
          <p>{errorMessage}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <UniverseCanvas
        onReady={setControls}
        onZoomChange={(scale, level) => {
          setZoomPercent(Math.round(scale * 100));
          setZoomLevel(level);
        }}
      />

      {status === "loading" && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div className="loading-text">Charting the IT universe…</div>
        </div>
      )}

      {status === "ready" && (
        <>
          <TopBar />
          <HUD />
          <NodePanel />
          <ZoomControls controls={controls} zoomPercent={zoomPercent} />
          <Legend />
          <div className="zoom-level-tag">{zoomLevel} view</div>
        </>
      )}
    </div>
  );
}
