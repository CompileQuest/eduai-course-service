/*
  Warnings:

  - You are about to drop the column `average_rating` on the `CourseStatistics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CourseStatistics" DROP COLUMN "average_rating",
ADD COLUMN     "statistical_average_rating" DOUBLE PRECISION;
