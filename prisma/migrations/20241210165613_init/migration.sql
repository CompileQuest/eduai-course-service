-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "course_id" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "introduction" TEXT,
    "difficulty_level" TEXT,
    "price" DOUBLE PRECISION,
    "discounted_price" DOUBLE PRECISION,
    "requirements" TEXT,
    "duration" INTEGER,
    "introduction_video_link" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseStatistics" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_number" INTEGER,
    "average_rating" DOUBLE PRECISION,
    "total_reviews" INTEGER,
    "total_sections" INTEGER,
    "total_lectures" INTEGER,

    CONSTRAINT "CourseStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "section_id" TEXT NOT NULL,
    "section_title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
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
    "is_locked" BOOLEAN NOT NULL,
    "is_previewable" BOOLEAN NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "passing_score" INTEGER,
    "description" TEXT,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT,
    "correct_answers" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseDescription" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "CourseDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCategory" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "CourseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseTags" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "CourseTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgressVideos" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL,
    "video_id" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "UserProgressVideos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_course_id_key" ON "Course"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseStatistics_course_id_key" ON "CourseStatistics"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Section_section_id_key" ON "Section"("section_id");

-- CreateIndex
CREATE UNIQUE INDEX "Video_video_id_key" ON "Video"("video_id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseDescription_course_id_key" ON "CourseDescription"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "Tags"("name");

-- AddForeignKey
ALTER TABLE "CourseStatistics" ADD CONSTRAINT "CourseStatistics_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDescription" ADD CONSTRAINT "CourseDescription_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCategory" ADD CONSTRAINT "CourseCategory_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCategory" ADD CONSTRAINT "CourseCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTags" ADD CONSTRAINT "CourseTags_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTags" ADD CONSTRAINT "CourseTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgressVideos" ADD CONSTRAINT "UserProgressVideos_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgressVideos" ADD CONSTRAINT "UserProgressVideos_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
