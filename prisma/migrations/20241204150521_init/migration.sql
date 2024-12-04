-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "course_id" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "introduction" TEXT,
    "enrolled_number" INTEGER NOT NULL DEFAULT 0,
    "difficulty_level" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "discounted_price" DOUBLE PRECISION,
    "category_id" TEXT,
    "requirements" TEXT[],
    "duration" INTEGER,
    "introduction_video_link" TEXT,
    "description" TEXT,
    "transcript" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "section_id" TEXT NOT NULL,
    "section_title" TEXT NOT NULL,
    "section_description" TEXT,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "video_id" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "video_duration" INTEGER,
    "is_locked" BOOLEAN NOT NULL DEFAULT true,
    "is_previewable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "article_id" TEXT NOT NULL,
    "article_title" TEXT NOT NULL,
    "article_content" TEXT NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" SERIAL NOT NULL,
    "total_sections" INTEGER NOT NULL,
    "total_videos" INTEGER NOT NULL,
    "total_articles" INTEGER NOT NULL,
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_course_id_key" ON "Course"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_course_id_key" ON "Metadata"("course_id");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metadata" ADD CONSTRAINT "Metadata_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
