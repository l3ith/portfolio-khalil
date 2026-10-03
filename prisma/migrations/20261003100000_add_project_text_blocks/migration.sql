-- CreateTable
CREATE TABLE "ProjectTextBlock" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "bodyEn" TEXT NOT NULL DEFAULT '',
    "bodyFr" TEXT NOT NULL DEFAULT '',
    "width" TEXT NOT NULL DEFAULT 'narrow',
    "align" TEXT NOT NULL DEFAULT 'center',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTextBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectTextBlock_projectId_idx" ON "ProjectTextBlock"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectTextBlock" ADD CONSTRAINT "ProjectTextBlock_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
