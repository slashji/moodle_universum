import type { UniverseNode } from "@moodle-universum/shared";

function scoreMatch(name: string, query: string): number {
  const idx = name.toLowerCase().indexOf(query);
  if (idx === -1) return -1;
  return idx === 0 ? 0 : 1;
}

/** Case-insensitive substring search over node names, ranked by match position then importance. */
export function searchNodes(nodes: UniverseNode[], query: string, limit = 8): UniverseNode[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  return nodes
    .map((n) => ({ node: n, score: scoreMatch(n.name, q) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => a.score - b.score || a.node.importance - b.node.importance)
    .slice(0, limit)
    .map((r) => r.node);
}
