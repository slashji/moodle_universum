import { Graphics } from "pixi.js";
import type { UniverseEdge } from "@moodle-universum/shared";
import { COLORS, EDGE_STYLE } from "./constants";

interface EdgeEndpoint {
  x: number;
  y: number;
}

function drawDashedLine(
  g: Graphics,
  a: EdgeEndpoint,
  b: EdgeEndpoint,
  dash: number,
  gap: number,
  width: number,
  color: number,
  alpha: number
) {
  if (dash <= 0) {
    g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width, color, alpha });
    return;
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) return;
  const ux = dx / length;
  const uy = dy / length;
  let travelled = 0;
  let drawing = true;
  while (travelled < length) {
    const segment = Math.min(drawing ? dash : gap, length - travelled);
    if (drawing) {
      const sx = a.x + ux * travelled;
      const sy = a.y + uy * travelled;
      const ex = a.x + ux * (travelled + segment);
      const ey = a.y + uy * (travelled + segment);
      g.moveTo(sx, sy).lineTo(ex, ey).stroke({ width, color, alpha });
    }
    travelled += segment;
    drawing = !drawing;
  }
}

/**
 * Redraws all edges into a single Graphics batch. Called on data/camera
 * changes only — never per animation frame — so edge count doesn't affect
 * steady-state frame cost.
 */
export function drawEdges(
  g: Graphics,
  edges: UniverseEdge[],
  positions: Map<string, EdgeEndpoint>,
  opts: {
    selectedNodeId: string | null;
    connectedEdgeIds: Set<string>;
    hasSelection: boolean;
  }
) {
  g.clear();
  for (const edge of edges) {
    const a = positions.get(edge.source);
    const b = positions.get(edge.target);
    if (!a || !b) continue;

    const style = EDGE_STYLE[edge.type] ?? EDGE_STYLE.related;
    const isConnectedToSelection = opts.connectedEdgeIds.has(edge.id);
    const dimmed = opts.hasSelection && !isConnectedToSelection;

    const color = isConnectedToSelection
      ? COLORS.edgeHighlight
      : dimmed
        ? COLORS.edgeDim
        : COLORS.edgeDefault;
    const alpha = isConnectedToSelection
      ? Math.min(1, style.alpha + 0.4)
      : dimmed
        ? style.alpha * 0.25
        : style.alpha;
    const width = isConnectedToSelection ? style.width + 0.8 : style.width;

    drawDashedLine(g, a, b, style.dash, style.gap, width, color, alpha);

    if (edge.type === "unlocks" || edge.type === "prerequisite") {
      drawArrowhead(g, a, b, color, alpha, isConnectedToSelection ? 7 : 5);
    }
  }
}

function drawArrowhead(
  g: Graphics,
  a: EdgeEndpoint,
  b: EdgeEndpoint,
  color: number,
  alpha: number,
  size: number
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) return;
  const ux = dx / length;
  const uy = dy / length;
  const midX = a.x + ux * length * 0.55;
  const midY = a.y + uy * length * 0.55;
  const perpX = -uy;
  const perpY = ux;

  g.poly([
    midX + ux * size,
    midY + uy * size,
    midX - ux * size * 0.6 + perpX * size * 0.6,
    midY - uy * size * 0.6 + perpY * size * 0.6,
    midX - ux * size * 0.6 - perpX * size * 0.6,
    midY - uy * size * 0.6 - perpY * size * 0.6,
  ]).fill({ color, alpha });
}
