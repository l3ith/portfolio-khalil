-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "subtitleFr" TEXT NOT NULL,
    "subtitleEn" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "accent" TEXT NOT NULL DEFAULT '75',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "sketchLabel" TEXT,
    "renderLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ratio" TEXT NOT NULL DEFAULT '16/9',
    "labelFr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCredit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "roleFr" TEXT NOT NULL,
    "roleEn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "About" (
    "id" TEXT NOT NULL,
    "bioFr" TEXT NOT NULL,
    "bioEn" TEXT NOT NULL,
    "portraitUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "About_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "aboutId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "roleFr" TEXT NOT NULL,
    "roleEn" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "siteTitleFr" TEXT NOT NULL DEFAULT 'Khalil — Designer automobile',
    "siteTitleEn" TEXT NOT NULL DEFAULT 'Khalil — Automotive Designer',
    "siteTaglineFr" TEXT NOT NULL DEFAULT 'Concept, série, écran.',
    "siteTaglineEn" TEXT NOT NULL DEFAULT 'Concept, series, screen.',
    "metaDescriptionFr" TEXT NOT NULL DEFAULT 'Portfolio de Khalil, designer automobile.',
    "metaDescriptionEn" TEXT NOT NULL DEFAULT 'Portfolio of Khalil, automotive designer.',
    "email" TEXT NOT NULL DEFAULT 'contact@example.com',
    "location" TEXT NOT NULL DEFAULT 'Paris / Turin',
    "socials" JSONB NOT NULL DEFAULT '[]',
    "bgLight" TEXT NOT NULL DEFAULT '#f4f3ef',
    "fgLight" TEXT NOT NULL DEFAULT '#0a0a0a',
    "mutedLight" TEXT NOT NULL DEFAULT '#737373',
    "bgDark" TEXT NOT NULL DEFAULT '#050505',
    "fgDark" TEXT NOT NULL DEFAULT '#f0eee8',
    "mutedDark" TEXT NOT NULL DEFAULT 'rgba(240,238,232,0.55)',
    "accentL" DOUBLE PRECISION NOT NULL DEFAULT 0.78,
    "accentC" DOUBLE PRECISION NOT NULL DEFAULT 0.17,
    "accentH" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "fontDisplay" TEXT NOT NULL DEFAULT 'Space Grotesk',
    "fontMono" TEXT NOT NULL DEFAULT 'JetBrains Mono',
    "fontBody" TEXT NOT NULL DEFAULT 'Inter',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_categoryId_idx" ON "Project"("categoryId");

-- CreateIndex
CREATE INDEX "Project_published_featured_idx" ON "Project"("published", "featured");

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_idx" ON "ProjectImage"("projectId");

-- CreateIndex
CREATE INDEX "ProjectCredit_projectId_idx" ON "ProjectCredit"("projectId");

-- CreateIndex
CREATE INDEX "Timeline_aboutId_idx" ON "Timeline"("aboutId");

-- CreateIndex
CREATE INDEX "Message_read_createdAt_idx" ON "Message"("read", "createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCredit" ADD CONSTRAINT "ProjectCredit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "About"("id") ON DELETE CASCADE ON UPDATE CASCADE;
