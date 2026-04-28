-- CreateTable
CREATE TABLE "SketchbookItem" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "ratio" TEXT NOT NULL DEFAULT '4/3',
    "posX" INTEGER NOT NULL DEFAULT 50,
    "posY" INTEGER NOT NULL DEFAULT 50,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "titleFr" TEXT NOT NULL DEFAULT '',
    "noteEn" TEXT NOT NULL DEFAULT '',
    "noteFr" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SketchbookItem_pkey" PRIMARY KEY ("id")
);
