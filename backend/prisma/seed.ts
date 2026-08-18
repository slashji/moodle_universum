import { PrismaClient } from "@prisma/client";
import { domains, domainCenter, edges, nodePosition, nodes } from "./seedData.js";

const prisma = new PrismaClient();

function nodeTypeToDb(type: string) {
  return type.toUpperCase() as "COURSE" | "KNOWLEDGE" | "TECHNOLOGY";
}
function edgeTypeToDb(type: string) {
  return type.toUpperCase().replace(/-/g, "_") as
    "PREREQUISITE" | "RELATED" | "RECOMMENDED_NEXT" | "CONTAINS" | "UNLOCKS";
}

async function main() {
  console.log(`Seeding ${domains.length} domains, ${nodes.length} nodes, ${edges.length} edges...`);

  const domainIdByKey = new Map<string, string>();
  for (const d of domains) {
    const center = domainCenter(d.angleDeg);
    const domain = await prisma.domain.upsert({
      where: { key: d.key },
      update: {
        name: d.name,
        color: d.color,
        description: d.description,
        centerX: center.x,
        centerY: center.y,
      },
      create: {
        key: d.key,
        name: d.name,
        color: d.color,
        description: d.description,
        centerX: center.x,
        centerY: center.y,
      },
    });
    domainIdByKey.set(d.key, domain.id);
  }

  const nodesByDomain = new Map<string, typeof nodes>();
  for (const n of nodes) {
    if (!nodesByDomain.has(n.domain)) nodesByDomain.set(n.domain, []);
    nodesByDomain.get(n.domain)!.push(n);
  }

  for (const [domainKey, domainNodes] of nodesByDomain) {
    const domainId = domainIdByKey.get(domainKey);
    if (!domainId) throw new Error(`Unknown domain key: ${domainKey}`);
    const center = domainCenter(domains.find((d) => d.key === domainKey)!.angleDeg);

    for (let i = 0; i < domainNodes.length; i++) {
      const n = domainNodes[i];
      const pos = nodePosition(center.x, center.y, i);

      await prisma.universeNode.upsert({
        where: { id: n.id },
        update: {
          type: nodeTypeToDb(n.type),
          name: n.name,
          description: n.description,
          domainId,
          x: pos.x,
          y: pos.y,
          size: n.type === "course" ? 3 : n.importance && n.importance >= 4 ? 2 : 1,
          importance: n.importance ?? 1,
        },
        create: {
          id: n.id,
          type: nodeTypeToDb(n.type),
          name: n.name,
          description: n.description,
          domainId,
          x: pos.x,
          y: pos.y,
          size: n.type === "course" ? 3 : n.importance && n.importance >= 4 ? 2 : 1,
          importance: n.importance ?? 1,
        },
      });

      if (n.moodleCourseId != null) {
        await prisma.moodleCourseMapping.upsert({
          where: { nodeId: n.id },
          update: { moodleCourseId: n.moodleCourseId },
          create: { nodeId: n.id, moodleCourseId: n.moodleCourseId },
        });
      }
    }
  }

  for (const e of edges) {
    await prisma.universeEdge.upsert({
      where: {
        sourceNodeId_targetNodeId_type: {
          sourceNodeId: e.source,
          targetNodeId: e.target,
          type: edgeTypeToDb(e.type),
        },
      },
      update: {},
      create: {
        sourceNodeId: e.source,
        targetNodeId: e.target,
        type: edgeTypeToDb(e.type),
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
