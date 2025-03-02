const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { APIError, STATUS_CODES } = require('../../utils/error-handler');
const { AppError } = require('../../utils/error-handler');

class AdminRepository {
    constructor() {
        this.prisma = new PrismaClient();
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

}

module.exports = AdminRepository; 
