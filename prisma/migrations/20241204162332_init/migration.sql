/*
  Warnings:

  - You are about to drop the column `category_id` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `enrolled_number` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `transcript` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Course` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal`.
  - You are about to alter the column `discounted_price` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal`.
  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Metadata` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[section_id]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[video_id]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_section_id_fkey";

-- DropForeignKey
ALTER TABLE "Metadata" DROP CONSTRAINT "Metadata_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_section_id_fkey";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "category_id",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "enrolled_number",
DROP COLUMN "transcript",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "course_id" DROP NOT NULL,
ALTER COLUMN "course_id" SET DATA TYPE VARCHAR,
ALTER COLUMN "thumbnail_url" SET DATA TYPE VARCHAR,
ALTER COLUMN "difficulty_level" SET DATA TYPE VARCHAR,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL,
ALTER COLUMN "discounted_price" SET DATA TYPE DECIMAL,
ALTER COLUMN "requirements" DROP NOT NULL,
ALTER COLUMN "requirements" SET DATA TYPE TEXT,
ALTER COLUMN "introduction_video_link" SET DATA TYPE VARCHAR;
DROP SEQUENCE "Course_id_seq";

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "order" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "course_id" DROP NOT NULL,
ALTER COLUMN "section_id" DROP NOT NULL,
ALTER COLUMN "section_id" SET DATA TYPE VARCHAR,
ALTER COLUMN "section_title" DROP NOT NULL,
ALTER COLUMN "section_title" SET DATA TYPE VARCHAR;
DROP SEQUENCE "Section_id_seq";

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "section_id" DROP NOT NULL,
ALTER COLUMN "video_id" DROP NOT NULL,
ALTER COLUMN "video_id" SET DATA TYPE VARCHAR,
ALTER COLUMN "video_url" DROP NOT NULL,
ALTER COLUMN "video_url" SET DATA TYPE VARCHAR,
ALTER COLUMN "is_locked" DROP NOT NULL,
ALTER COLUMN "is_locked" DROP DEFAULT,
ALTER COLUMN "is_previewable" DROP NOT NULL,
ALTER COLUMN "is_previewable" DROP DEFAULT;
DROP SEQUENCE "Video_id_seq";

-- DropTable
DROP TABLE "Article";

-- DropTable
DROP TABLE "Metadata";

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course_Category" (
    "id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "category_id" INTEGER,

    CONSTRAINT "Course_Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course_Description" (
    "id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "description" TEXT,

    CONSTRAINT "Course_Description_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course_Statistics" (
    "id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "enrolled_number" INTEGER,
    "average_rating" DECIMAL,
    "total_reviews" INTEGER,
    "total_sections" INTEGER,
    "total_lectures" INTEGER,

    CONSTRAINT "Course_Statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course_Tags" (
    "id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "tag_id" INTEGER,

    CONSTRAINT "Course_Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "course_id" INTEGER,
    "question" TEXT,
    "answer" TEXT,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL,
    "quiz_id" INTEGER,
    "text" TEXT,
    "type" VARCHAR,
    "options" TEXT,
    "correct_answers" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" INTEGER NOT NULL,
    "section_id" INTEGER,
    "title" VARCHAR,
    "passing_score" INTEGER,
    "description" TEXT,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "user_id" INTEGER,
    "rating" DECIMAL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Progress_videos" (
    "id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "course_id" INTEGER,
    "section_id" INTEGER,
    "video_id" INTEGER,
    "is_completed" BOOLEAN,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "User_Progress_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_Description_course_id_key" ON "Course_Description"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Course_Statistics_course_id_key" ON "Course_Statistics"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "Tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_section_id_key" ON "Section"("section_id");

-- CreateIndex
CREATE UNIQUE INDEX "Video_video_id_key" ON "Video"("video_id");

-- AddForeignKey
ALTER TABLE "Course_Category" ADD CONSTRAINT "Course_Category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course_Category" ADD CONSTRAINT "Course_Category_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course_Description" ADD CONSTRAINT "Course_Description_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course_Statistics" ADD CONSTRAINT "Course_Statistics_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course_Tags" ADD CONSTRAINT "Course_Tags_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course_Tags" ADD CONSTRAINT "Course_Tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Progress_videos" ADD CONSTRAINT "User_Progress_videos_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Progress_videos" ADD CONSTRAINT "User_Progress_videos_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
