/**
 * Universe graph model — the layout/curriculum layer.
 * This is intentionally separate from Moodle data (see moodle.ts).
 * Moodle answers "what is the completion state"; the universe answers
 * "where does this live, what domain is it in, what does it connect to".
 */

export type NodeType = "domain" | "course" | "knowledge" | "technology";

export type EdgeType = "prerequisite" | "related" | "recommended-next" | "contains" | "unlocks";

/** Student-facing completion status, derived from merged Moodle data. */
export type CompletionStatus = "not_started" | "in_progress" | "completed";

/**
 * Static, admin-authored node data as stored in the database.
 * Does not include any live Moodle completion state.
 */
export interface UniverseNodeRecord {
  id: string;
  type: NodeType;
  name: string;
  description: string | null;
  domainId: string | null;
  moodleCourseId: number | null;
  x: number;
  y: number;
  size: number;
  importance: number;
  createdAt: string;
  updatedAt: string;
}

export interface UniverseEdgeRecord {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
  weight: number;
  createdAt: string;
}

export interface DomainRecord {
  id: string;
  key: string;
  name: string;
  color: string;
  description: string | null;
  centerX: number;
  centerY: number;
}

/**
 * Node as delivered to the frontend: static universe data merged with
 * live Moodle completion, computed server-side by the merge service.
 */
export interface UniverseNode {
  id: string;
  type: NodeType;
  name: string;
  description: string | null;
  domain: string | null;
  moodleCourseId: number | null;
  x: number;
  y: number;
  size: number;
  importance: number;
  completion: number | null;
  status: CompletionStatus;
}

export interface UniverseEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
}

export interface Domain {
  id: string;
  key: string;
  name: string;
  color: string;
  description: string | null;
  centerX: number;
  centerY: number;
  completion: number;
  courseCount: number;
  completedCount: number;
}

export interface UniverseGraph {
  nodes: UniverseNode[];
  edges: UniverseEdge[];
  domains: Domain[];
}

export interface ProgressSummary {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  averageCompletion: number;
  totalKnowledgeNodes: number;
  discoveredPercent: number;
  byDomain: Array<{
    domainKey: string;
    domainName: string;
    completion: number;
  }>;
}
