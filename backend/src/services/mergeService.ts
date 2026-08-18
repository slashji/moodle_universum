import type {
  CompletionStatus,
  Domain,
  DomainRecord,
  MoodleCourse,
  UniverseEdge,
  UniverseEdgeRecord,
  UniverseNode,
  UniverseNodeRecord,
} from "@moodle-universum/shared";

function courseStatus(course: MoodleCourse | undefined): {
  completion: number | null;
  status: CompletionStatus;
} {
  if (!course) return { completion: null, status: "not_started" };
  if (course.completed) return { completion: course.completion ?? 100, status: "completed" };
  if (course.completion != null && course.completion > 0) {
    return { completion: course.completion, status: "in_progress" };
  }
  return { completion: course.completion, status: "not_started" };
}

/**
 * Merges static universe node data with live Moodle completion data using
 * moodleCourseId as the stable join key. This is the ONLY place Moodle
 * state and universe layout state come together — everything downstream
 * (routes, frontend) works off the merged result.
 */
export function mergeUniverseWithMoodle(
  nodeRecords: Array<UniverseNodeRecord & { moodleCourseId: number | null }>,
  edgeRecords: UniverseEdgeRecord[],
  domainRecords: DomainRecord[],
  moodleCourses: MoodleCourse[]
): { nodes: UniverseNode[]; edges: UniverseEdge[]; domains: Domain[] } {
  const coursesById = new Map(moodleCourses.map((c) => [c.id, c]));

  // adjacency for deriving a "discovery" signal on nodes with no direct
  // Moodle mapping (knowledge/technology nodes)
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edgeRecords) {
    if (!adjacency.has(edge.sourceNodeId)) adjacency.set(edge.sourceNodeId, new Set());
    if (!adjacency.has(edge.targetNodeId)) adjacency.set(edge.targetNodeId, new Set());
    adjacency.get(edge.sourceNodeId)!.add(edge.targetNodeId);
    adjacency.get(edge.targetNodeId)!.add(edge.sourceNodeId);
  }

  const directStatus = new Map<string, CompletionStatus>();
  const directCompletion = new Map<string, number | null>();

  for (const record of nodeRecords) {
    if (record.type === "course" && record.moodleCourseId != null) {
      const { completion, status } = courseStatus(coursesById.get(record.moodleCourseId));
      directStatus.set(record.id, status);
      directCompletion.set(record.id, completion);
    }
  }

  const nodes: UniverseNode[] = nodeRecords.map((record) => {
    if (directStatus.has(record.id)) {
      return {
        id: record.id,
        type: record.type,
        name: record.name,
        description: record.description,
        domain: record.domainId,
        moodleCourseId: record.moodleCourseId,
        x: record.x,
        y: record.y,
        size: record.size,
        importance: record.importance,
        completion: directCompletion.get(record.id) ?? null,
        status: directStatus.get(record.id)!,
      };
    }

    // knowledge/technology/domain nodes: derive a soft "discovered" status
    // from directly connected nodes so the map feels like it's being
    // revealed as the student progresses, without Moodle tracking them.
    const neighbors = adjacency.get(record.id) ?? new Set();
    let sawCompleted = false;
    let sawInProgress = false;
    for (const neighborId of neighbors) {
      const neighborRecord = nodeRecords.find((n) => n.id === neighborId);
      const nStatus = neighborRecord ? directStatus.get(neighborRecord.id) : undefined;
      if (nStatus === "completed") sawCompleted = true;
      if (nStatus === "in_progress") sawInProgress = true;
    }
    const status: CompletionStatus = sawCompleted
      ? "in_progress"
      : sawInProgress
        ? "in_progress"
        : "not_started";

    return {
      id: record.id,
      type: record.type,
      name: record.name,
      description: record.description,
      domain: record.domainId,
      moodleCourseId: record.moodleCourseId,
      x: record.x,
      y: record.y,
      size: record.size,
      importance: record.importance,
      completion: null,
      status,
    };
  });

  const edges: UniverseEdge[] = edgeRecords.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    type: e.type,
    weight: e.weight,
  }));

  const nodesByDomain = new Map<string, UniverseNode[]>();
  for (const node of nodes) {
    if (!node.domain) continue;
    if (!nodesByDomain.has(node.domain)) nodesByDomain.set(node.domain, []);
    nodesByDomain.get(node.domain)!.push(node);
  }

  const domains: Domain[] = domainRecords.map((d) => {
    const domainNodes = (nodesByDomain.get(d.key) ?? []).filter((n) => n.type === "course");
    const withCompletion = domainNodes.filter((n) => n.completion != null);
    const completion =
      withCompletion.length > 0
        ? Math.round(
            withCompletion.reduce((sum, n) => sum + (n.completion ?? 0), 0) / withCompletion.length
          )
        : 0;
    return {
      id: d.id,
      key: d.key,
      name: d.name,
      color: d.color,
      description: d.description,
      centerX: d.centerX,
      centerY: d.centerY,
      completion,
      courseCount: domainNodes.length,
      completedCount: domainNodes.filter((n) => n.status === "completed").length,
    };
  });

  return { nodes, edges, domains };
}
