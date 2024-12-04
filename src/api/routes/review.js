const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client

module.exports = (app) => {
    // Error handler middleware
    const errorHandler = (err, req, res, next) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            return res.status(400).json({ message: 'Duplicate entry found.' });
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ message: 'Review not found.' });
        }
        if (err instanceof Prisma.PrismaClientValidationError) {
            return res.status(400).json({ message: 'Validation error in Prisma request.' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    };

    // Add a new review
    app.post('/reviews/add-review', async (req, res, next) => {
        try {
            const { course_id, user_id, rating, comment } = req.body;

            // Check if review already exists for this course and user
            const existingReview = await prisma.review.findFirst({
                where: {
                    course_id,
                    user_id,
                }
            });
            if (existingReview) {
                return res.status(400).json({ message: 'Review already exists for this user and course.' });
            }

            // Create the review
            const newReview = await prisma.review.create({
                data: {
                    course_id,
                    user_id,
                    rating,
                    comment,
                    created_at: new Date(),
                }
            });

            res.status(201).json(newReview);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Get all reviews
    app.get('/reviews/all', async (req, res, next) => {
        try {
            const reviews = await prisma.review.findMany({
                include: {
                    Course: true,
                }
            });
            res.status(200).json(reviews);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    app.get('/reviews/all/:courseId', async (req, res, next) => {
        try {
            const { courseId } = req.params;
    
            // Fetch reviews for a specific course
            const reviews = await prisma.review.findMany({
                where: {
                    course_id: parseInt(courseId) // Filter by the course_id
                },
                include: {
                    Course: true, // Include course details (optional)
                }
            });
    
            if (reviews.length === 0) {
                return res.status(404).json({ message: 'No reviews found for this course.' });
            }
    
            res.status(200).json(reviews);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });
    

    // Get a specific review by ID
    app.get('/reviews/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const review = await prisma.review.findUnique({
                where: { id: parseInt(id) },
                include: {
                    Course: true,
                }
            });
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }
            res.status(200).json(review);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Delete a specific review by ID
    app.delete('/reviews/delete/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const deletedReview = await prisma.review.delete({
                where: { id: parseInt(id) }
            });
            res.status(200).json({ message: 'Review deleted', deletedReview });
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Update a specific review by ID
    app.put('/reviews/update/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;

            const updateData = {
                rating,
                comment,
            };

            const updatedReview = await prisma.review.update({
                where: { id: parseInt(id) },
                data: updateData,
            });

            res.status(200).json(updatedReview);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Use the error handler
    app.use(errorHandler);
};
