-- AlterTable
CREATE SEQUENCE course_id_seq;
ALTER TABLE "Course" ALTER COLUMN "id" SET DEFAULT nextval('course_id_seq');
ALTER SEQUENCE course_id_seq OWNED BY "Course"."id";
