const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { APIError, STATUS_CODES, InternalServerError, } = require('../../utils/app-error');



class QuizRepository {
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
                    }
                },
            },
        });

        // Handle cases where the course or section does not exist
        if (!course) {
            throw new InternalServerError(`Course with ID ${courseId} not found or deleted.`);
        }
        if (!course.sections.length) {
            throw new InternalServerError(`Section with ID ${sectionId} not found in this course.`);
        }

        const section = course.sections[0];

        // Handle cases where no files are found
        if (!section.files.length) {
            throw new InternalServerError(`No files found for section ${sectionId}.`);
        }

        return section.files; // Return only files, not the full course object
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

module.exports = QuizRepository; 
