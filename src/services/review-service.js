const ReviewRepository = require('../database/repository/review-repository');
const { APIError } = require('../utils/app-errors');

class ReviewService {
    constructor() {
        this.repository = new ReviewRepository();
    }

    async AddReview(reviewDetails) {
        return await this.repository.AddReview(reviewDetails);
    }

    async FetchAllReviews() {
        return await this.repository.FetchAllReviews();
    }

    async FetchReviewById(reviewId) {
        return await this.repository.FetchReviewById(reviewId);
    }

    async DeleteReviewById(reviewId) {
        return await this.repository.DeleteReviewById(reviewId);
    }

    async UpdateReview(reviewId, updates) {
        return await this.repository.UpdateReviewById(reviewId, updates);
    }
}

module.exports = ReviewService;
