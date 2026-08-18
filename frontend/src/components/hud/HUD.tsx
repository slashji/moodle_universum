import { useState } from "react";
import { useUniverseStore } from "../../state/store";

export function HUD() {
  const progress = useUniverseStore((s) => s.progress);
  const moodleDegraded = useUniverseStore((s) => s.moodleDegraded);
  const [expanded, setExpanded] = useState(false);

  if (!progress) return null;

  return (
    <div className="hud-panel">
      <button className="hud-title" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        IT UNIVERSE <span className="hud-title-chevron">{expanded ? "▲" : "▼"}</span>
      </button>
      <div className="hud-row hud-row-main">
        <span>Overall discovered</span>
        <span className="hud-value">{progress.discoveredPercent}%</span>
      </div>
      <div className="hud-bar">
        <div className="hud-bar-fill" style={{ width: `${progress.discoveredPercent}%` }} />
      </div>
      <div className="hud-row">
        <span>Courses</span>
        <span className="hud-value">
          {progress.completedCourses + progress.inProgressCourses} / {progress.totalCourses}
        </span>
      </div>
      <div className="hud-row">
        <span>Completed</span>
        <span className="hud-value hud-completed">{progress.completedCourses}</span>
      </div>
      <div className="hud-row">
        <span>In progress</span>
        <span className="hud-value hud-inprogress">{progress.inProgressCourses}</span>
      </div>
      <div className="hud-row">
        <span>Knowledge nodes</span>
        <span className="hud-value">{progress.totalKnowledgeNodes}</span>
      </div>
      {expanded && (
        <div className="hud-domains">
          {progress.byDomain.map((d) => (
            <div className="hud-domain-row" key={d.domainKey}>
              <span className="hud-domain-name">{d.domainName}</span>
              <div className="hud-domain-bar">
                <div className="hud-domain-bar-fill" style={{ width: `${d.completion}%` }} />
              </div>
              <span className="hud-domain-pct">{d.completion}%</span>
            </div>
          ))}
        </div>
      )}
      {moodleDegraded && (
        <div className="hud-warning">Moodle unreachable — showing cached layout only</div>
      )}
    </div>
  );
}
