import { describe, expect, it } from "vitest";
import type { Domain, UniverseNode } from "@moodle-universum/shared";
import { computeProgressSummary } from "./progressService.js";

function courseNode(overrides: Partial<UniverseNode>): UniverseNode {
  return {
    id: "n",
    type: "course",
    name: "Course",
    description: null,
    domain: "linux",
    moodleCourseId: 1,
    x: 0,
    y: 0,
    size: 1,
    importance: 1,
    completion: null,
    status: "not_started",
    ...overrides,
  };
}

const domains: Domain[] = [
  {
    id: "d1",
    key: "linux",
    name: "Linux",
    color: "#000",
    description: null,
    centerX: 0,
    centerY: 0,
    completion: 80,
    courseCount: 2,
    completedCount: 1,
  },
];

describe("computeProgressSummary", () => {
  it("counts courses by status and averages completion", () => {
    const nodes: UniverseNode[] = [
      courseNode({ id: "c1", status: "completed", completion: 100 }),
      courseNode({ id: "c2", status: "in_progress", completion: 40 }),
      courseNode({ id: "c3", status: "not_started", completion: null }),
    ];
    const summary = computeProgressSummary(nodes, domains);
    expect(summary.totalCourses).toBe(3);
    expect(summary.completedCourses).toBe(1);
    expect(summary.inProgressCourses).toBe(1);
    expect(summary.notStartedCourses).toBe(1);
    expect(summary.averageCompletion).toBe(70); // avg of the two courses with known completion
  });

  it("computes discoveredPercent across all node types, not just courses", () => {
    const nodes: UniverseNode[] = [
      courseNode({ id: "c1", type: "course", status: "completed", completion: 100 }),
      courseNode({ id: "k1", type: "knowledge", status: "not_started", completion: null }),
    ];
    const summary = computeProgressSummary(nodes, domains);
    expect(summary.discoveredPercent).toBe(50);
  });

  it("passes through domain completion for later teacher-dashboard reuse", () => {
    const summary = computeProgressSummary([], domains);
    expect(summary.byDomain).toEqual([{ domainKey: "linux", domainName: "Linux", completion: 80 }]);
  });
});
