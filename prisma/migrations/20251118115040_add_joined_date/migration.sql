-- CreateEnum
CREATE TYPE "ProtocolCategory" AS ENUM ('WET_LAB', 'COMPUTATIONAL', 'SAFETY', 'GENERAL');

-- CreateEnum
CREATE TYPE "ProtocolDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "joinedDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "NoteTask" ADD COLUMN     "protocolId" TEXT;

-- CreateTable
CREATE TABLE "Protocol" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ProtocolCategory" NOT NULL DEFAULT 'GENERAL',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "estimatedTime" TEXT,
    "difficulty" "ProtocolDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "tags" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "projectId" TEXT,
    "documentId" TEXT,
    "materials" TEXT,
    "equipment" TEXT,
    "steps" TEXT,
    "safetyNotes" TEXT,
    "versionHistory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Protocol_documentId_key" ON "Protocol"("documentId");

-- CreateIndex
CREATE INDEX "Protocol_title_idx" ON "Protocol"("title");

-- CreateIndex
CREATE INDEX "Protocol_category_idx" ON "Protocol"("category");

-- CreateIndex
CREATE INDEX "Protocol_authorId_idx" ON "Protocol"("authorId");

-- CreateIndex
CREATE INDEX "Protocol_projectId_idx" ON "Protocol"("projectId");

-- CreateIndex
CREATE INDEX "NoteTask_protocolId_idx" ON "NoteTask"("protocolId");

-- AddForeignKey
ALTER TABLE "NoteTask" ADD CONSTRAINT "NoteTask_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
