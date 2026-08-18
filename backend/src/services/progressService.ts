import type { Domain, ProgressSummary, UniverseNode } from "@moodle-universum/shared";

/**
 * Computes HUD/dashboard statistics from the merged universe. Kept separate
 * from mergeService so these aggregates can be reused later for a teacher
 * dashboard (per-student or class-wide) without re-deriving merge logic.
 */
export function computeProgressSummary(nodes: UniverseNode[], domains: Domain[]): ProgressSummary {
  const courseNodes = nodes.filter((n) => n.type === "course");
  const completedCourses = courseNodes.filter((n) => n.status === "completed").length;
  const inProgressCourses = courseNodes.filter((n) => n.status === "in_progress").length;
  const notStartedCourses = courseNodes.length - completedCourses - inProgressCourses;

  const withCompletion = courseNodes.filter((n) => n.completion != null);
  const averageCompletion =
    withCompletion.length > 0
      ? Math.round(
          withCompletion.reduce((sum, n) => sum + (n.completion ?? 0), 0) / withCompletion.length
        )
      : 0;

  const knowledgeNodes = nodes.filter((n) => n.type === "knowledge" || n.type === "technology");
  const discoveredNodes = nodes.filter((n) => n.status !== "not_started");
  const discoveredPercent =
    nodes.length > 0 ? Math.round((discoveredNodes.length / nodes.length) * 100) : 0;

  return {
    totalCourses: courseNodes.length,
    completedCourses,
    inProgressCourses,
    notStartedCourses,
    averageCompletion,
    totalKnowledgeNodes: knowledgeNodes.length,
    discoveredPercent,
    byDomain: domains.map((d) => ({
      domainKey: d.key,
      domainName: d.name,
      completion: d.completion,
    })),
  };
}
