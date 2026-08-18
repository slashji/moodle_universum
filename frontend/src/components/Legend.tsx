const EDGE_LEGEND: Array<{ label: string; style: "solid" | "dashed" | "dotted" | "long-dash" }> = [
  { label: "Prerequisite", style: "solid" },
  { label: "Related", style: "dashed" },
  { label: "Recommended next", style: "long-dash" },
  { label: "Contains", style: "dotted" },
];

export function Legend() {
  return (
    <div className="legend-panel">
      <div className="legend-section">
        <div className="legend-heading">Status</div>
        <div className="legend-row">
          <span className="legend-icon">○</span> Not started
        </div>
        <div className="legend-row">
          <span className="legend-icon">◐</span> In progress
        </div>
        <div className="legend-row">
          <span className="legend-icon">●</span> Completed
        </div>
      </div>
      <div className="legend-section">
        <div className="legend-heading">Connections</div>
        {EDGE_LEGEND.map((e) => (
          <div className="legend-row" key={e.label}>
            <span className={`legend-line legend-line-${e.style}`} /> {e.label}
          </div>
        ))}
      </div>
    </div>
  );
}
