import { describe, expect, it } from "vitest";
import type {
  DomainRecord,
  MoodleCourse,
  UniverseEdgeRecord,
  UniverseNodeRecord,
} from "@moodle-universum/shared";
import { mergeUniverseWithMoodle } from "./mergeService.js";

function node(
  overrides: Partial<UniverseNodeRecord & { moodleCourseId: number | null }>
): UniverseNodeRecord & { moodleCourseId: number | null } {
  return {
    id: "node-1",
    type: "knowledge",
    name: "Node",
    description: null,
    domainId: "linux",
    moodleCourseId: null,
    x: 0,
    y: 0,
    size: 1,
    importance: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const domains: DomainRecord[] = [
  {
    id: "d1",
    key: "linux",
    name: "Linux",
    color: "#4ade80",
    description: null,
    centerX: 0,
    centerY: 0,
  },
];

describe("mergeUniverseWithMoodle", () => {
  it("marks a course as completed using moodleCourseId as the join key", () => {
    const nodes = [node({ id: "course-1", type: "course", moodleCourseId: 55 })];
    const courses: MoodleCourse[] = [
      {
        id: 55,
        fullname: "Linux",
        shortname: "LINUX",
        category: "OS",
        completion: 100,
        completed: true,
      },
    ];
    const { nodes: merged } = mergeUniverseWithMoodle(nodes, [], domains, courses);
    expect(merged[0].status).toBe("completed");
    expect(merged[0].completion).toBe(100);
  });

  it("marks a course as in_progress when partially complete", () => {
    const nodes = [node({ id: "course-1", type: "course", moodleCourseId: 61 })];
    const courses: MoodleCourse[] = [
      {
        id: 61,
        fullname: "Net",
        shortname: "NET",
        category: "Net",
        completion: 40,
        completed: false,
      },
    ];
    const { nodes: merged } = mergeUniverseWithMoodle(nodes, [], domains, courses);
    expect(merged[0].status).toBe("in_progress");
    expect(merged[0].completion).toBe(40);
  });

  it("marks a course as not_started when there is no matching Moodle enrollment", () => {
    const nodes = [node({ id: "course-1", type: "course", moodleCourseId: 999 })];
    const { nodes: merged } = mergeUniverseWithMoodle(nodes, [], domains, []);
    expect(merged[0].status).toBe("not_started");
    expect(merged[0].completion).toBeNull();
  });

  it("derives a soft in_progress status for knowledge nodes connected to a completed course", () => {
    const nodes = [
      node({ id: "course-1", type: "course", moodleCourseId: 55 }),
      node({ id: "knowledge-1", type: "knowledge" }),
      node({ id: "knowledge-2", type: "knowledge" }),
    ];
    const edges: UniverseEdgeRecord[] = [
      {
        id: "e1",
        sourceNodeId: "course-1",
        targetNodeId: "knowledge-1",
        type: "contains",
        weight: 1,
        createdAt: "",
      },
    ];
    const courses: MoodleCourse[] = [
      {
        id: 55,
        fullname: "Linux",
        shortname: "LINUX",
        category: "OS",
        completion: 100,
        completed: true,
      },
    ];
    const { nodes: merged } = mergeUniverseWithMoodle(nodes, edges, domains, courses);
    const connected = merged.find((n) => n.id === "knowledge-1")!;
    const unconnected = merged.find((n) => n.id === "knowledge-2")!;
    expect(connected.status).toBe("in_progress");
    expect(unconnected.status).toBe("not_started");
  });

  it("computes per-domain average completion across course nodes only", () => {
    const nodes = [
      node({ id: "course-1", type: "course", domainId: "linux", moodleCourseId: 55 }),
      node({ id: "course-2", type: "course", domainId: "linux", moodleCourseId: 56 }),
      node({ id: "knowledge-1", type: "knowledge", domainId: "linux" }),
    ];
    const courses: MoodleCourse[] = [
      { id: 55, fullname: "A", shortname: "A", category: "x", completion: 100, completed: true },
      { id: 56, fullname: "B", shortname: "B", category: "x", completion: 50, completed: false },
    ];
    const { domains: mergedDomains } = mergeUniverseWithMoodle(nodes, [], domains, courses);
    expect(mergedDomains[0].completion).toBe(75);
    expect(mergedDomains[0].courseCount).toBe(2);
    expect(mergedDomains[0].completedCount).toBe(1);
  });
});
