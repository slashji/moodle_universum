import type { MoodleCourse, MoodleUser } from "./moodle.js";
import type {
  Domain,
  EdgeType,
  NodeType,
  ProgressSummary,
  UniverseEdge,
  UniverseGraph,
  UniverseNode,
} from "./universe.js";

export interface MeResponse {
  user: MoodleUser;
  role: "student" | "admin";
}

export interface MoodleCoursesResponse {
  courses: MoodleCourse[];
}

export interface UniverseResponse extends UniverseGraph {
  progress: ProgressSummary;
  /** "degraded" means Moodle was unreachable and completion data may be stale/absent. */
  moodleStatus: "ok" | "degraded";
}

export interface DomainsResponse {
  domains: Domain[];
}

export interface ApiErrorBody {
  error: string;
  message: string;
  detail?: string;
}

export interface CreateNodeInput {
  type: NodeType;
  name: string;
  description?: string | null;
  domainId?: string | null;
  moodleCourseId?: number | null;
  x: number;
  y: number;
  size?: number;
  importance?: number;
}

export type UpdateNodeInput = Partial<CreateNodeInput>;

export interface CreateEdgeInput {
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
  weight?: number;
}

export interface LayoutUpdateInput {
  positions: Array<{ id: string; x: number; y: number }>;
}

export type { UniverseNode, UniverseEdge };
