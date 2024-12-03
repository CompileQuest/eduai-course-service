const ReviewRepository = require('../database/repository/review-repository');
const { APIError } = require('../utils/app-errors');

class ReviewService {
    constructor() {
        this.repository = new ReviewRepository();
    }

    // Add a new review
    async AddReview(reviewDetails) {
        return await this.repository.AddReview(reviewDetails);
    }

    // Fetch all reviews for a specific course
    async FetchReviewsByCourseId(courseId) {
        return await this.repository.FetchReviewsByCourseId(courseId);
    }

    // Fetch a specific review by review ID
    async FetchReviewById(reviewId) {
        return await this.repository.FetchReviewById(reviewId);
    }

    // Update a review by review ID
    async UpdateReview(reviewId, updates) {
        return await this.repository.UpdateReviewById(reviewId, updates);
    }

    // Delete a review by review ID
    async DeleteReview(reviewId, courseId) {
        return await this.repository.DeleteReviewById(reviewId, courseId);
    }
}

module.exports = ReviewService;
