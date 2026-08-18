-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN', 'TEACHER');

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('DOMAIN', 'COURSE', 'KNOWLEDGE', 'TECHNOLOGY');

-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('PREREQUISITE', 'RELATED', 'RECOMMENDED_NEXT', 'CONTAINS', 'UNLOCKS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "moodleUserId" INTEGER,
    "email" TEXT,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "centerX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "centerY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniverseNode" (
    "id" TEXT NOT NULL,
    "type" "NodeType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domainId" TEXT,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "size" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniverseNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniverseEdge" (
    "id" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "type" "EdgeType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniverseEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodleCourseMapping" (
    "id" TEXT NOT NULL,
    "moodleCourseId" INTEGER NOT NULL,
    "nodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodleCourseMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_moodleUserId_key" ON "User"("moodleUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_key_key" ON "Domain"("key");

-- CreateIndex
CREATE INDEX "UniverseNode_domainId_idx" ON "UniverseNode"("domainId");

-- CreateIndex
CREATE INDEX "UniverseNode_type_idx" ON "UniverseNode"("type");

-- CreateIndex
CREATE INDEX "UniverseEdge_sourceNodeId_idx" ON "UniverseEdge"("sourceNodeId");

-- CreateIndex
CREATE INDEX "UniverseEdge_targetNodeId_idx" ON "UniverseEdge"("targetNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "UniverseEdge_sourceNodeId_targetNodeId_type_key" ON "UniverseEdge"("sourceNodeId", "targetNodeId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MoodleCourseMapping_moodleCourseId_key" ON "MoodleCourseMapping"("moodleCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "MoodleCourseMapping_nodeId_key" ON "MoodleCourseMapping"("nodeId");

-- AddForeignKey
ALTER TABLE "UniverseNode" ADD CONSTRAINT "UniverseNode_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniverseEdge" ADD CONSTRAINT "UniverseEdge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "UniverseNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniverseEdge" ADD CONSTRAINT "UniverseEdge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "UniverseNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodleCourseMapping" ADD CONSTRAINT "MoodleCourseMapping_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "UniverseNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
