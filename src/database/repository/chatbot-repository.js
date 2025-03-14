import { PrismaClient } from '@prisma/client';
import { APIError, STATUS_CODES, AppError } from '../../utils/app-errors.js';

const prisma = new PrismaClient();


class ChatBotRepository {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async checkIfCourseExists(courseId) {
        return await this.prisma.course.findUnique({
            where: { id: courseId },
        });
    }


    async getFileBySectionId(courseId, sectionId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId, deletedAt: null },
            select: {
                sections: {
                    where: { id: sectionId, deletedAt: null },
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        sectionTitle: true,
                        order: true,
                        files: {
                            where: { deletedAt: null },
                            select: {
                                id: true,
                                secure_url: true
                            }
                        }
                    },
                },
            },
        });
        return course; // No "not found" check here
    }

    async getFilesForCourse(courseId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId, deletedAt: null },
            select: {
                id: true,
                title: true,
                sections: {
                    where: { deletedAt: null },
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        sectionTitle: true,
                        order: true,
                        files: {
                            where: { deletedAt: null },
                            select: {
                                id: true,
                                secure_url: true
                            }
                        }
                    },
                },
            },
        });
        return course; // No "not found" check here
    }
}
export default ChatBotRepository; 
