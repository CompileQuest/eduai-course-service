import { PrismaClient } from '@prisma/client';
import { APIError, STATUS_CODES, AppError } from '../../utils/app-errors.js';
import { COURSE_STATUS } from '../../constants/courseStatusEnum.js';

const prisma = new PrismaClient();


class AdminRepository {
    constructor() {
        this.prisma = new PrismaClient();
    }



    async publishCourse(courseId) {
        const publishedCousre = await prisma.course.update({
            where: { id: courseId },
            data: {
                status: COURSE_STATUS.PUBLISHED, // If using enum, you can use CourseStatus.PUBLISHED
            },
        });
        return publishedCousre;
    }



    async getPaginatedCourses(page, limit, status) {
        console.log("this is the status ", status);

        const skip = (page - 1) * limit;

        // If status is "all", do not filter by status; otherwise, filter by the provided status
        const whereCondition = status === "all" ? {} : { status };

        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where: whereCondition, // Dynamically apply filter
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' } // Optional: Sort by latest
            }),
            this.prisma.course.count({ where: whereCondition }) // Total courses count (with or without status filter)
        ]);

        return { courses, total };
    }


    async getCoursesFiltered({
        searchByTitle, title,
        page = 1, limit = 10
    }) {
        const skip = (page - 1) * limit;

        // Dynamically construct the filter conditions
        const whereCondition = {
            ...(searchByTitle && title && { title: { contains: title, mode: "insensitive" } }),
        };

        // Fetch courses & total count in parallel
        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.course.count({ where: whereCondition }),
        ]);

        return { courses, total };
    }


}

export default AdminRepository; 
