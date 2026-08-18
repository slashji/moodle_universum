import { useMemo, useState } from "react";
import { useUniverseStore } from "../../state/store";
import { queries } from "../../api/queries";
import type { EdgeType, UniverseNode } from "@moodle-universum/shared";

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};
const STATUS_ICON: Record<string, string> = {
  not_started: "○",
  in_progress: "◐",
  completed: "●",
};
const EDGE_TYPES: EdgeType[] = [
  "related",
  "prerequisite",
  "recommended-next",
  "contains",
  "unlocks",
];
const EDGE_LABEL: Record<EdgeType, string> = {
  related: "Related",
  prerequisite: "Prerequisite",
  "recommended-next": "Recommended next",
  contains: "Contains",
  unlocks: "Unlocks",
};

const MOODLE_BASE_URL = import.meta.env.VITE_MOODLE_BASE_URL;

export function NodePanel() {
  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);
  const nodes = useUniverseStore((s) => s.nodes);
  const edges = useUniverseStore((s) => s.edges);
  const domains = useUniverseStore((s) => s.domains);
  const editorMode = useUniverseStore((s) => s.editorMode);
  const linkSourceId = useUniverseStore((s) => s.linkSourceId);
  const linkEdgeType = useUniverseStore((s) => s.linkEdgeType);
  const selectNode = useUniverseStore((s) => s.selectNode);
  const requestFlyTo = useUniverseStore((s) => s.requestFlyTo);
  const setLinkSource = useUniverseStore((s) => s.setLinkSource);
  const setLinkEdgeType = useUniverseStore((s) => s.setLinkEdgeType);
  const removeNodeLocal = useUniverseStore((s) => s.removeNodeLocal);
  const removeEdgeLocal = useUniverseStore((s) => s.removeEdgeLocal);
  const upsertNodeLocal = useUniverseStore((s) => s.upsertNodeLocal);

  const nodesById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const domainNameByKey = useMemo(() => new Map(domains.map((d) => [d.key, d.name])), [domains]);

  const node = selectedNodeId ? (nodesById.get(selectedNodeId) ?? null) : null;

  const [descDraft, setDescDraft] = useState<string | null>(null);
  const [importanceDraft, setImportanceDraft] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const nodeEdges = useMemo(() => {
    if (!node) return [];
    return edges
      .filter((e) => e.source === node.id || e.target === node.id)
      .map((e) => ({
        edge: e,
        other: nodesById.get(e.source === node.id ? e.target : e.source),
        direction: e.source === node.id ? ("out" as const) : ("in" as const),
      }))
      .filter((x): x is { edge: typeof x.edge; other: UniverseNode; direction: "out" | "in" } =>
        Boolean(x.other)
      );
  }, [edges, node, nodesById]);

  if (!node) {
    return (
      <aside className="node-panel node-panel-empty">
        <p>Select a node to inspect it.</p>
        {editorMode && (
          <p className="node-panel-hint">Editor mode: drag any node to reposition it.</p>
        )}
      </aside>
    );
  }

  const related = nodeEdges.filter((e) => e.edge.type === "related" || e.edge.type === "contains");
  const recommended = nodeEdges.filter((e) => e.edge.type === "recommended-next");
  const prerequisites = nodeEdges.filter(
    (e) => e.edge.type === "prerequisite" && e.direction === "in"
  );

  const description = descDraft ?? node.description ?? "";
  const importance = importanceDraft ?? node.importance;

  async function handleSaveDetails() {
    if (!node) return;
    setSaving(true);
    try {
      await queries.updateNode(node.id, { description, importance });
      upsertNodeLocal({ ...node, description, importance });
      setDescDraft(null);
      setImportanceDraft(null);
    } catch (err) {
      console.error("Failed to save node details:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNode() {
    if (!node) return;
    if (!confirm(`Delete "${node.name}" from the universe? This also removes its connections.`))
      return;
    try {
      await queries.deleteNode(node.id);
      removeNodeLocal(node.id);
    } catch (err) {
      console.error("Failed to delete node:", err);
    }
  }

  async function handleDeleteEdge(edgeId: string) {
    try {
      await queries.deleteEdge(edgeId);
      removeEdgeLocal(edgeId);
    } catch (err) {
      console.error("Failed to delete edge:", err);
    }
  }

  return (
    <aside className="node-panel">
      <button
        className="node-panel-close"
        onClick={() => selectNode(null)}
        aria-label="Close panel"
      >
        ×
      </button>

      <div className="node-panel-eyebrow">
        {node.domain ? (domainNameByKey.get(node.domain) ?? node.domain) : "Universe"}
      </div>
      <h2 className="node-panel-title">{node.name}</h2>
      {node.moodleCourseId != null && (
        <div className="node-panel-subtitle">Moodle course #{node.moodleCourseId}</div>
      )}

      <div className="node-panel-status">
        <span className={`status-badge status-${node.status}`}>
          {STATUS_ICON[node.status]} {STATUS_LABEL[node.status]}
        </span>
      </div>

      {node.completion != null && (
        <div className="node-panel-progress">
          <div className="node-panel-progress-label">
            <span>Progress</span>
            <span>{node.completion}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${node.completion}%` }} />
          </div>
        </div>
      )}

      {node.description && !editorMode && (
        <p className="node-panel-description">{node.description}</p>
      )}

      {editorMode && (
        <div className="node-panel-description">
          <textarea
            value={description}
            onChange={(e) => setDescDraft(e.target.value)}
            rows={3}
            placeholder="Description..."
          />
          <label className="importance-label">
            Importance
            <input
              type="number"
              min={1}
              max={10}
              value={importance}
              onChange={(e) => setImportanceDraft(Number(e.target.value))}
            />
          </label>
          <div className="node-panel-editor-actions">
            <button disabled={saving} onClick={handleSaveDetails}>
              Save details
            </button>
            <button className="danger" onClick={handleDeleteNode}>
              Delete node
            </button>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="node-panel-section">
          <h3>Related knowledge</h3>
          <ul>
            {related.map(({ edge, other }) => (
              <li key={edge.id}>
                <button className="link-button" onClick={() => requestFlyTo(other.id)}>
                  {other.name}
                </button>
                {editorMode && (
                  <button
                    className="danger tiny"
                    onClick={() => handleDeleteEdge(edge.id)}
                    title="Remove connection"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {prerequisites.length > 0 && (
        <div className="node-panel-section">
          <h3>Prerequisites</h3>
          <ul>
            {prerequisites.map(({ edge, other }) => (
              <li key={edge.id}>
                <button className="link-button" onClick={() => requestFlyTo(other.id)}>
                  {other.name}
                </button>
                {editorMode && (
                  <button
                    className="danger tiny"
                    onClick={() => handleDeleteEdge(edge.id)}
                    title="Remove connection"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommended.length > 0 && (
        <div className="node-panel-section">
          <h3>Recommended next</h3>
          <ul>
            {recommended.map(({ edge, other }) => (
              <li key={edge.id}>
                <button className="link-button" onClick={() => requestFlyTo(other.id)}>
                  {other.name}
                </button>
                {editorMode && (
                  <button
                    className="danger tiny"
                    onClick={() => handleDeleteEdge(edge.id)}
                    title="Remove connection"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {node.moodleCourseId != null && (
        <a
          className="node-panel-moodle-link"
          href={`${MOODLE_BASE_URL}/course/view.php?id=${node.moodleCourseId}`}
          target="_blank"
          rel="noreferrer"
        >
          Open Moodle course ↗
        </a>
      )}

      {editorMode && (
        <div className="node-panel-section node-panel-linking">
          <h3>Connections</h3>
          {linkSourceId === node.id ? (
            <p className="node-panel-hint">
              Click another node in the universe to connect it. Click here to cancel.
            </p>
          ) : (
            <p className="node-panel-hint">
              Choose a type, then click "Start connecting" and pick a target node.
            </p>
          )}
          <select
            value={linkEdgeType}
            onChange={(e) => setLinkEdgeType(e.target.value as EdgeType)}
          >
            {EDGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {EDGE_LABEL[t]}
              </option>
            ))}
          </select>
          <button onClick={() => setLinkSource(linkSourceId === node.id ? null : node.id)}>
            {linkSourceId === node.id ? "Cancel" : "Start connecting"}
          </button>
        </div>
      )}
    </aside>
  );
}
