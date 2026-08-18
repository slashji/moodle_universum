import { Router } from "express";
import type { DomainsResponse } from "@moodle-universum/shared";
import { getMoodleProvider } from "../providers/moodle/index.js";
import { listDomains, listEdges, listNodes } from "../services/universeService.js";
import { mergeUniverseWithMoodle } from "../services/mergeService.js";

export const domainsRouter = Router();

domainsRouter.get("/", async (req, res, next) => {
  try {
    const provider = getMoodleProvider();
    const moodleUserId = req.user!.moodleUserId;
    const user = moodleUserId ? { id: moodleUserId } : await provider.getCurrentUser();

    const [nodes, edges, domainRecords, courses] = await Promise.all([
      listNodes(),
      listEdges(),
      listDomains(),
      provider.getEnrolledCourses(user.id).catch(() => []),
    ]);

    const { domains } = mergeUniverseWithMoodle(nodes, edges, domainRecords, courses);
    const body: DomainsResponse = { domains };
    res.json(body);
  } catch (err) {
    next(err);
  }
});
