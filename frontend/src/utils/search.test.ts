import { describe, expect, it } from "vitest";
import type { UniverseNode } from "@moodle-universum/shared";
import { searchNodes } from "./search";

function node(overrides: Partial<UniverseNode>): UniverseNode {
  return {
    id: overrides.name?.toLowerCase().replace(/\s+/g, "-") ?? "node",
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

const nodes: UniverseNode[] = [
  node({ name: "Docker" }),
  node({ name: "Docker Compose" }),
  node({ name: "Kubernetes" }),
  node({ name: "Container Security" }),
];

describe("searchNodes", () => {
  it("returns nothing for an empty query", () => {
    expect(searchNodes(nodes, "")).toEqual([]);
    expect(searchNodes(nodes, "   ")).toEqual([]);
  });

  it("matches case-insensitively by substring", () => {
    const results = searchNodes(nodes, "DOCKER");
    expect(results.map((n) => n.name)).toEqual(
      expect.arrayContaining(["Docker", "Docker Compose"])
    );
  });

  it("ranks prefix matches above mid-string matches", () => {
    const results = searchNodes(nodes, "cont");
    // "Container Security" starts with "cont"; nothing else does
    expect(results[0].name).toBe("Container Security");
  });

  it("respects the result limit", () => {
    const many = Array.from({ length: 20 }, (_, i) => node({ name: `Topic ${i}` }));
    expect(searchNodes(many, "topic", 5)).toHaveLength(5);
  });
});
