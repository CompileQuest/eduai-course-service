const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { APIError, STATUS_CODES } = require('../../utils/error-handler');
const { AppError } = require('../../utils/error-handler');

class QuizRepository {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async checkIfCourseExists(courseId) {
        return await this.prisma.course.findUnique({
            where: { id: courseId },
        });
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
            },
        });
        return course; // No "not found" check here
    }
}

module.exports = QuizRepository; 
