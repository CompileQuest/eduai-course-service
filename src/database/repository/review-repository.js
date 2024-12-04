const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { APIError, STATUS_CODES } = require('../../utils/app-errors');

class ReviewRepository {
    async AddReview(reviewDetails) {
        try {
            return await prisma.review.create({
                data: reviewDetails,
            });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Review');
        }
    }

    async FetchAllReviews() {
        try {
            return await prisma.review.findMany({
                include: {
                    Course: true,
                }
            });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Reviews');
        }
    }

    async FetchReviewById(reviewId) {
        try {
            const review = await prisma.review.findUnique({
                where: { id: reviewId },
                include: {
                    Course: true,
                }
            });
            if (!review) throw new Error('Review Not Found');
            return review;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Review');
        }
    }

    async DeleteReviewById(reviewId) {
        try {
            const review = await prisma.review.delete({
                where: { id: reviewId },
            });
            if (!review) throw new Error('Review Not Found');
            return review;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Delete Review');
        }
    }

    async UpdateReviewById(reviewId, updates) {
        try {
            const review = await prisma.review.update({
                where: { id: reviewId },
                data: updates,
            });
            if (!review) throw new Error('Review Not Found');
            return review;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Update Review');
        }
    }
}

module.exports = ReviewRepository;
