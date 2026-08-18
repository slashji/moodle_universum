import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/auth.js";
import {
  createEdge,
  createNode,
  deleteEdge,
  deleteNode,
  updateLayout,
  updateNode,
} from "../services/universeService.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

const nodeTypeSchema = z.enum(["domain", "course", "knowledge", "technology"]);
const edgeTypeSchema = z.enum([
  "prerequisite",
  "related",
  "recommended-next",
  "contains",
  "unlocks",
]);

const createNodeSchema = z.object({
  type: nodeTypeSchema,
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullish(),
  domainId: z.string().trim().min(1).max(100).nullish(),
  moodleCourseId: z.number().int().positive().nullish(),
  x: z.number(),
  y: z.number(),
  size: z.number().positive().max(20).optional(),
  importance: z.number().int().min(1).max(10).optional(),
});

const updateNodeSchema = createNodeSchema.partial();

const createEdgeSchema = z.object({
  sourceNodeId: z.string().trim().min(1),
  targetNodeId: z.string().trim().min(1),
  type: edgeTypeSchema,
  weight: z.number().positive().max(10).optional(),
});

const layoutSchema = z.object({
  positions: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        x: z.number(),
        y: z.number(),
      })
    )
    .min(1)
    .max(5000),
});

adminRouter.post("/nodes", async (req, res, next) => {
  try {
    const input = createNodeSchema.parse(req.body);
    const id = await createNode(input);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/nodes/:id", async (req, res, next) => {
  try {
    const input = updateNodeSchema.parse(req.body);
    await updateNode(req.params.id, input);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/nodes/:id", async (req, res, next) => {
  try {
    await deleteNode(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/edges", async (req, res, next) => {
  try {
    const input = createEdgeSchema.parse(req.body);
    const id = await createEdge(input);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/edges/:id", async (req, res, next) => {
  try {
    await deleteEdge(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/layout", async (req, res, next) => {
  try {
    const input = layoutSchema.parse(req.body);
    await updateLayout(input);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
