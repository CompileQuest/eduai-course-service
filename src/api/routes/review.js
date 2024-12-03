// src/api/routes/review.js
const express = require('express');
const Review = require('../../models/Review');  // Ensure this path is correct
const router = express.Router();

// Get all reviews for a specific course
router.get('/courses/:course_id/reviews', async (req, res, next) => {
    try {
        const reviews = await Review.find({ course_id: req.params.course_id });
        res.status(200).json(reviews);
    } catch (err) {
        next(err);
    }
});

// Add a new review for a specific course
router.post('/courses/:course_id/reviews', async (req, res, next) => {
    try {
        const newReview = new Review({
            review_id: req.body.review_id,
            course_id: req.params.course_id,
            user_id: req.body.user_id,
            rating: req.body.rating,
            comment: req.body.comment
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (err) {
        next(err);
    }
});

// Update a review for a specific course
router.put('/courses/:course_id/reviews/:review_id', async (req, res, next) => {
    try {
        const updatedReview = await Review.findOneAndUpdate(
            { review_id: req.params.review_id, course_id: req.params.course_id },
            req.body,
            { new: true }
        );
        res.status(200).json(updatedReview);
    } catch (err) {
        next(err);
    }
});

// Delete a review for a specific course
router.delete('/courses/:course_id/reviews/:review_id', async (req, res, next) => {
    try {
        await Review.findOneAndDelete({
            review_id: req.params.review_id,
            course_id: req.params.course_id
        });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = (app) => {
    app.use('/api', router);  // This tells Express to use this router for all routes starting with /api
};