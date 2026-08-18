import { beforeEach, describe, expect, it } from "vitest";
import type { UniverseEdge, UniverseNode } from "@moodle-universum/shared";
import { useUniverseStore } from "./store";

function node(overrides: Partial<UniverseNode>): UniverseNode {
  return {
    id: "n",
    type: "knowledge",
    name: "Node",
    description: null,
    domain: "linux",
    moodleCourseId: null,
    x: 0,
    y: 0,
    size: 1,
    importance: 1,
    completion: null,
    status: "not_started",
    ...overrides,
  };
}

const edge: UniverseEdge = { id: "e1", source: "a", target: "b", type: "related", weight: 1 };

beforeEach(() => {
  useUniverseStore.setState({
    nodes: [node({ id: "a" }), node({ id: "b" })],
    edges: [edge],
    selectedNodeId: null,
    editorMode: false,
    linkSourceId: null,
  });
});

describe("useUniverseStore", () => {
  it("selects and deselects a node", () => {
    useUniverseStore.getState().selectNode("a");
    expect(useUniverseStore.getState().selectedNodeId).toBe("a");
    useUniverseStore.getState().selectNode(null);
    expect(useUniverseStore.getState().selectedNodeId).toBeNull();
  });

  it("removing a node also removes edges touching it and clears selection if selected", () => {
    useUniverseStore.getState().selectNode("a");
    useUniverseStore.getState().removeNodeLocal("a");
    const state = useUniverseStore.getState();
    expect(state.nodes.find((n) => n.id === "a")).toBeUndefined();
    expect(state.edges).toHaveLength(0);
    expect(state.selectedNodeId).toBeNull();
  });

  it("removing an unselected node leaves selection untouched", () => {
    useUniverseStore.getState().selectNode("b");
    useUniverseStore.getState().removeNodeLocal("a");
    expect(useUniverseStore.getState().selectedNodeId).toBe("b");
  });

  it("updates a node's position without touching other fields", () => {
    useUniverseStore.getState().updateNodePositionLocal("a", 42, 99);
    const a = useUniverseStore.getState().nodes.find((n) => n.id === "a")!;
    expect(a.x).toBe(42);
    expect(a.y).toBe(99);
    expect(a.name).toBe("Node");
  });

  it("upserts an existing node in place and appends new ones", () => {
    useUniverseStore.getState().upsertNodeLocal(node({ id: "a", name: "Renamed" }));
    expect(useUniverseStore.getState().nodes).toHaveLength(2);
    expect(useUniverseStore.getState().nodes.find((n) => n.id === "a")?.name).toBe("Renamed");

    useUniverseStore.getState().upsertNodeLocal(node({ id: "c", name: "New" }));
    expect(useUniverseStore.getState().nodes).toHaveLength(3);
  });

  it("toggling editor mode off clears any pending link-source selection", () => {
    useUniverseStore.getState().setEditorMode(true);
    useUniverseStore.getState().setLinkSource("a");
    expect(useUniverseStore.getState().linkSourceId).toBe("a");
    useUniverseStore.getState().toggleEditorMode();
    expect(useUniverseStore.getState().linkSourceId).toBeNull();
  });
});
