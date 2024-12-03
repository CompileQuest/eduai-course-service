const ReviewModel = require('../../models/Review');
const { APIError, STATUS_CODES } = require('../../utils/app-errors');

class ReviewRepository {
    // Add a new review
    async AddReview(reviewDetails) {
        try {
            const review = new ReviewModel(reviewDetails);
            return await review.save();
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Review');
        }
    }

    // Fetch all reviews for a specific course
    async FetchReviewsByCourseId(courseId) {
        try {
            return await ReviewModel.find({ course_id: courseId });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Reviews');
        }
    }

    // Fetch a specific review by review ID
    async FetchReviewById(reviewId) {
        try {
            return await ReviewModel.findOne({ review_id: reviewId });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Review');
        }
    }

    // Update a review by review ID
    async UpdateReviewById(reviewId, updates) {
        try {
            const review = await ReviewModel.findOneAndUpdate(
                { review_id: reviewId },
                { $set: updates },
                { new: true, runValidators: true }
            );
            if (!review) throw new Error('Review Not Found');
            return review;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Update Review');
        }
    }

    // Delete a review by review ID
    async DeleteReviewById(reviewId, courseId) {
        try {
            const review = await ReviewModel.findOneAndDelete({ review_id: reviewId, course_id: courseId });
            if (!review) throw new Error('Review Not Found');
            return review;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Delete Review');
        }
    }
}

module.exports = ReviewRepository;
