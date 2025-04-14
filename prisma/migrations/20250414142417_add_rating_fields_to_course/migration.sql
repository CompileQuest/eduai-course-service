-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "average_rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "total_reviews" INTEGER DEFAULT 0;
