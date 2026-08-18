import { create } from "zustand";
import type {
  Domain,
  MeResponse,
  ProgressSummary,
  UniverseEdge,
  UniverseNode,
} from "@moodle-universum/shared";

export type LoadStatus = "loading" | "ready" | "error";

interface FlyToRequest {
  nodeId: string;
  requestId: number;
}

/**
 * App-level state: universe graph data, selection, search, and editor mode.
 * Deliberately excludes camera/pan/zoom — that lives inside the imperative
 * PixiJS renderer (see components/universe/UniverseRenderer.ts) so that
 * high-frequency camera updates never trigger React re-renders.
 */
interface UniverseAppState {
  status: LoadStatus;
  errorMessage: string | null;
  moodleDegraded: boolean;

  me: MeResponse | null;
  nodes: UniverseNode[];
  edges: UniverseEdge[];
  domains: Domain[];
  progress: ProgressSummary | null;

  selectedNodeId: string | null;
  searchQuery: string;
  editorMode: boolean;
  flyToRequest: FlyToRequest | null;
  linkSourceId: string | null;
  linkEdgeType: import("@moodle-universum/shared").EdgeType;

  setLoading: () => void;
  setError: (message: string) => void;
  setLoaded: (data: {
    me: MeResponse;
    nodes: UniverseNode[];
    edges: UniverseEdge[];
    domains: Domain[];
    progress: ProgressSummary;
    moodleDegraded: boolean;
  }) => void;

  selectNode: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  requestFlyTo: (nodeId: string) => void;
  clearFlyToRequest: () => void;
  toggleEditorMode: () => void;
  setEditorMode: (on: boolean) => void;
  setLinkSource: (id: string | null) => void;
  setLinkEdgeType: (type: import("@moodle-universum/shared").EdgeType) => void;

  upsertNodeLocal: (node: UniverseNode) => void;
  removeNodeLocal: (id: string) => void;
  updateNodePositionLocal: (id: string, x: number, y: number) => void;
  addEdgeLocal: (edge: UniverseEdge) => void;
  removeEdgeLocal: (id: string) => void;
}

let flyToCounter = 0;

export const useUniverseStore = create<UniverseAppState>((set) => ({
  status: "loading",
  errorMessage: null,
  moodleDegraded: false,

  me: null,
  nodes: [],
  edges: [],
  domains: [],
  progress: null,

  selectedNodeId: null,
  searchQuery: "",
  editorMode: false,
  flyToRequest: null,
  linkSourceId: null,
  linkEdgeType: "related",

  setLoading: () => set({ status: "loading", errorMessage: null }),
  setError: (message) => set({ status: "error", errorMessage: message }),
  setLoaded: ({ me, nodes, edges, domains, progress, moodleDegraded }) =>
    set({
      status: "ready",
      me,
      nodes,
      edges,
      domains,
      progress,
      moodleDegraded,
      errorMessage: null,
    }),

  selectNode: (id) => set({ selectedNodeId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  requestFlyTo: (nodeId) =>
    set({ flyToRequest: { nodeId, requestId: ++flyToCounter }, selectedNodeId: nodeId }),
  clearFlyToRequest: () => set({ flyToRequest: null }),
  toggleEditorMode: () => set((s) => ({ editorMode: !s.editorMode, linkSourceId: null })),
  setEditorMode: (on) => set({ editorMode: on, linkSourceId: null }),
  setLinkSource: (id) => set({ linkSourceId: id }),
  setLinkEdgeType: (type) => set({ linkEdgeType: type }),

  upsertNodeLocal: (node) =>
    set((s) => ({
      nodes: s.nodes.some((n) => n.id === node.id)
        ? s.nodes.map((n) => (n.id === node.id ? node : n))
        : [...s.nodes, node],
    })),
  removeNodeLocal: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),
  updateNodePositionLocal: (id, x, y) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    })),
  addEdgeLocal: (edge) => set((s) => ({ edges: [...s.edges, edge] })),
  removeEdgeLocal: (id) => set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),
}));
