import { PrismaClient } from '@prisma/client';
import { APIError, STATUS_CODES, InternalServerError } from '../../utils/app-errors.js';

const prisma = new PrismaClient();

class QuizRepository {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async checkIfCourseExists(courseId) {
        return await this.prisma.course.findUnique({
            where: { id: courseId },
        });
    }


    async getFilesBySectionId(sectionId) {
        const section = await prisma.section.findFirst({
            where: {
                id: sectionId,
                deletedAt: null,
            },
            select: {
                id: true,
                sectionTitle: true,
                order: true,
                files: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        secure_url: true,
                    },
                },
            },
        });

        if (!section) {
            throw new InternalServerError(`Section with ID ${sectionId} not found or has been deleted.`);
        }

        if (!section.files.length) {
            throw new InternalServerError(`No files found for section ${sectionId}.`);
        }

        return section.files;
    }



    async FetchCourseContentById(courseId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId, deletedAt: null },
            select: {
                id: true,
                instructorId: true,
                title: true,
                shortDescription: true,
                difficultyLevel: true,
                price: true,
                requirements: true,
                description: true,
                WhatWillYouLearn: true,

                sections: {
                    where: { deletedAt: null },
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        sectionTitle: true,
                        order: true,
                    },
                },
                faqs: {
                    select: {
                        id: true,
                        courseId: true,
                        question: true,
                        answer: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            },
        });
        return course; // No "not found" check here
    }


}

export default QuizRepository; 
