const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { APIError, STATUS_CODES } = require('../../utils/app-errors');

class CourseRepository {
    async AddCourse(courseDetails) {
        try {
            return await prisma.course.create({
                data: courseDetails,
            });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Course');
        }
    }

    async FetchAllCourses() {
        try {
            return await prisma.course.findMany();
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Courses');
        }
    }

    async FetchCourseById(courseId) {
        try {
            const course = await prisma.course.findUnique({
                where: { course_id: courseId.trim() },
            });
            if (!course) throw new Error('Course Not Found');
            return course;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Course');
        }
    }

    async DeleteCourseById(courseId) {
        try {
            const course = await prisma.course.delete({
                where: { course_id: courseId.trim() },
            });
            if (!course) throw new Error('Course Not Found');
            return course;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Delete Course');
        }
    }

    async UpdateCourseById(courseId, updates) {
        try {
            const course = await prisma.course.update({
                where: { course_id: courseId.trim() },
                data: updates,
            });
            if (!course) throw new Error('Course Not Found');
            return course;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Update Course');
        }
    }
}

module.exports = CourseRepository;
