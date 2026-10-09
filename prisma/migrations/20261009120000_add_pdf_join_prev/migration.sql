-- AlterTable
ALTER TABLE "ProjectImage" ADD COLUMN "pdfJoinPrev" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProjectCarouselImage" ADD COLUMN "pdfJoinPrev" BOOLEAN NOT NULL DEFAULT false;
