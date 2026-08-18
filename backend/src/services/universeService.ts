import type {
  CreateEdgeInput,
  CreateNodeInput,
  DomainRecord,
  LayoutUpdateInput,
  UniverseEdgeRecord,
  UniverseNodeRecord,
  UpdateNodeInput,
} from "@moodle-universum/shared";
import { prisma } from "../database/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.js";

function nodeTypeToDb(type: string) {
  return type.toUpperCase() as "DOMAIN" | "COURSE" | "KNOWLEDGE" | "TECHNOLOGY";
}
function nodeTypeFromDb(type: string) {
  return type.toLowerCase() as UniverseNodeRecord["type"];
}
function edgeTypeToDb(type: string) {
  return type.toUpperCase().replace(/-/g, "_") as
    "PREREQUISITE" | "RELATED" | "RECOMMENDED_NEXT" | "CONTAINS" | "UNLOCKS";
}
function edgeTypeFromDb(type: string) {
  return type.toLowerCase().replace(/_/g, "-") as UniverseEdgeRecord["type"];
}

export async function listDomains(): Promise<DomainRecord[]> {
  const domains = await prisma.domain.findMany({ orderBy: { name: "asc" } });
  return domains.map((d) => ({
    id: d.id,
    key: d.key,
    name: d.name,
    color: d.color,
    description: d.description,
    centerX: d.centerX,
    centerY: d.centerY,
  }));
}

export async function listNodes(): Promise<
  Array<UniverseNodeRecord & { moodleCourseId: number | null }>
> {
  const nodes = await prisma.universeNode.findMany({
    include: { domain: true, moodleCourseMapping: true },
  });
  return nodes.map((n) => ({
    id: n.id,
    type: nodeTypeFromDb(n.type),
    name: n.name,
    description: n.description,
    domainId: n.domain?.key ?? null,
    moodleCourseId: n.moodleCourseMapping?.moodleCourseId ?? null,
    x: n.x,
    y: n.y,
    size: n.size,
    importance: n.importance,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }));
}

export async function listEdges(): Promise<UniverseEdgeRecord[]> {
  const edges = await prisma.universeEdge.findMany();
  return edges.map((e) => ({
    id: e.id,
    sourceNodeId: e.sourceNodeId,
    targetNodeId: e.targetNodeId,
    type: edgeTypeFromDb(e.type),
    weight: e.weight,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function createNode(input: CreateNodeInput) {
  let domainId: string | undefined;
  if (input.domainId) {
    const domain = await prisma.domain.findUnique({
      where: { key: input.domainId },
    });
    if (!domain) throw new NotFoundError(`Domain '${input.domainId}' not found`);
    domainId = domain.id;
  }

  const node = await prisma.universeNode.create({
    data: {
      type: nodeTypeToDb(input.type),
      name: input.name,
      description: input.description ?? null,
      domainId,
      x: input.x,
      y: input.y,
      size: input.size ?? 1,
      importance: input.importance ?? 1,
      ...(input.moodleCourseId
        ? {
            moodleCourseMapping: {
              create: { moodleCourseId: input.moodleCourseId },
            },
          }
        : {}),
    },
  });
  return node.id;
}

export async function updateNode(id: string, input: UpdateNodeInput) {
  const existing = await prisma.universeNode.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`Node '${id}' not found`);

  let domainId: string | null | undefined;
  if (input.domainId !== undefined) {
    if (input.domainId === null) {
      domainId = null;
    } else {
      const domain = await prisma.domain.findUnique({
        where: { key: input.domainId },
      });
      if (!domain) throw new NotFoundError(`Domain '${input.domainId}' not found`);
      domainId = domain.id;
    }
  }

  await prisma.universeNode.update({
    where: { id },
    data: {
      ...(input.type !== undefined ? { type: nodeTypeToDb(input.type) } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(domainId !== undefined ? { domainId } : {}),
      ...(input.x !== undefined ? { x: input.x } : {}),
      ...(input.y !== undefined ? { y: input.y } : {}),
      ...(input.size !== undefined ? { size: input.size } : {}),
      ...(input.importance !== undefined ? { importance: input.importance } : {}),
    },
  });

  if (input.moodleCourseId !== undefined) {
    await prisma.moodleCourseMapping.deleteMany({ where: { nodeId: id } });
    if (input.moodleCourseId !== null) {
      await prisma.moodleCourseMapping.create({
        data: { nodeId: id, moodleCourseId: input.moodleCourseId },
      });
    }
  }
}

export async function deleteNode(id: string) {
  const existing = await prisma.universeNode.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`Node '${id}' not found`);
  await prisma.universeNode.delete({ where: { id } });
}

export async function createEdge(input: CreateEdgeInput) {
  const [source, target] = await Promise.all([
    prisma.universeNode.findUnique({ where: { id: input.sourceNodeId } }),
    prisma.universeNode.findUnique({ where: { id: input.targetNodeId } }),
  ]);
  if (!source) throw new NotFoundError(`Node '${input.sourceNodeId}' not found`);
  if (!target) throw new NotFoundError(`Node '${input.targetNodeId}' not found`);

  const edge = await prisma.universeEdge.create({
    data: {
      sourceNodeId: input.sourceNodeId,
      targetNodeId: input.targetNodeId,
      type: edgeTypeToDb(input.type),
      weight: input.weight ?? 1,
    },
  });
  return edge.id;
}

export async function deleteEdge(id: string) {
  const existing = await prisma.universeEdge.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`Edge '${id}' not found`);
  await prisma.universeEdge.delete({ where: { id } });
}

export async function updateLayout(input: LayoutUpdateInput) {
  await prisma.$transaction(
    input.positions.map((p) =>
      prisma.universeNode.update({
        where: { id: p.id },
        data: { x: p.x, y: p.y },
      })
    )
  );
}
