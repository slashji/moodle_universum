import { Router } from "express";
import type { UniverseResponse } from "@moodle-universum/shared";
import { getMoodleProvider } from "../providers/moodle/index.js";
import { listDomains, listEdges, listNodes } from "../services/universeService.js";
import { mergeUniverseWithMoodle } from "../services/mergeService.js";
import { computeProgressSummary } from "../services/progressService.js";

export const universeRouter = Router();

async function buildUniverseResponse(moodleUserId: number | null): Promise<UniverseResponse> {
  const provider = getMoodleProvider();
  const [nodes, edges, domainRecords] = await Promise.all([
    listNodes(),
    listEdges(),
    listDomains(),
  ]);

  let courses: Awaited<ReturnType<typeof provider.getEnrolledCourses>> = [];
  let moodleStatus: "ok" | "degraded" = "ok";
  try {
    const user = moodleUserId ? { id: moodleUserId } : await provider.getCurrentUser();
    courses = await provider.getEnrolledCourses(user.id);
  } catch (err) {
    console.error("Moodle fetch failed, serving universe without live completion:", err);
    moodleStatus = "degraded";
  }

  const merged = mergeUniverseWithMoodle(nodes, edges, domainRecords, courses);
  const progress = computeProgressSummary(merged.nodes, merged.domains);

  return { ...merged, progress, moodleStatus };
}

universeRouter.get("/", async (req, res, next) => {
  try {
    res.json(await buildUniverseResponse(req.user!.moodleUserId));
  } catch (err) {
    next(err);
  }
});

universeRouter.get("/nodes", async (req, res, next) => {
  try {
    const body = await buildUniverseResponse(req.user!.moodleUserId);
    res.json({ nodes: body.nodes });
  } catch (err) {
    next(err);
  }
});

universeRouter.get("/edges", async (_req, res, next) => {
  try {
    const edges = await listEdges();
    res.json({
      edges: edges.map((e) => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
        type: e.type,
        weight: e.weight,
      })),
    });
  } catch (err) {
    next(err);
  }
});
