-- CreateTable
CREATE TABLE "ProjectCarousel" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "ratio" TEXT NOT NULL DEFAULT '16/9',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "titleFr" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCarouselImage" (
    "id" TEXT NOT NULL,
    "carouselId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ratio" TEXT NOT NULL DEFAULT '16/9',
    "posX" INTEGER NOT NULL DEFAULT 50,
    "posY" INTEGER NOT NULL DEFAULT 50,
    "caption" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectCarouselImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectCarousel_projectId_idx" ON "ProjectCarousel"("projectId");

-- CreateIndex
CREATE INDEX "ProjectCarouselImage_carouselId_idx" ON "ProjectCarouselImage"("carouselId");

-- AddForeignKey
ALTER TABLE "ProjectCarousel" ADD CONSTRAINT "ProjectCarousel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCarouselImage" ADD CONSTRAINT "ProjectCarouselImage_carouselId_fkey" FOREIGN KEY ("carouselId") REFERENCES "ProjectCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
