const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client

module.exports = (app) => {
    // Error handler middleware
    const errorHandler = (err, req, res, next) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            return res.status(400).json({ message: 'Duplicate entry found.' });
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ message: 'Course not found.' });
        }
        if (err instanceof Prisma.PrismaClientValidationError) {
            return res.status(400).json({ message: 'Validation error in Prisma request.' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    };

    // Add a new course
    app.post('/courses/add-course', async (req, res, next) => {
        try {
            const {
                course_id,
                thumbnail_url,
                introduction,
                difficulty_level,
                price,
                discounted_price,
                requirements,
                duration,
                introduction_video_link
            } = req.body;

            // Check if course already exists
            const existingCourse = await prisma.course.findUnique({
                where: { course_id }
            });
            if (existingCourse) {
                return res.status(400).json({ message: 'Course with this ID already exists' });
            }

            // Create the course without relations for testing
            const newCourse = await prisma.course.create({
                data: {
                    course_id,
                    thumbnail_url,
                    introduction,
                    difficulty_level,
                    price,
                    discounted_price,
                    requirements,
                    duration,
                    introduction_video_link
                }
            });

            res.status(201).json(newCourse);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Get all courses
    app.get('/courses/all', async (req, res, next) => {
        try {
            const courses = await prisma.course.findMany();
            res.status(200).json(courses);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Get a specific course by ID
    app.get('/courses/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const course = await prisma.course.findUnique({
                where: { id: parseInt(id) }
            });
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.status(200).json(course);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Delete a specific course by ID
    app.delete('/courses/delete/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const deletedCourse = await prisma.course.delete({
                where: { id: parseInt(id) }
            });
            res.status(200).json({ message: 'Course deleted', deletedCourse });
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Update a specific course by ID
    app.put('/courses/update/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                thumbnail_url, introduction, difficulty_level, price,
                discounted_price, requirements, duration, introduction_video_link
            } = req.body;

            const updateData = {
                thumbnail_url,
                introduction,
                difficulty_level,
                price,
                discounted_price,
                requirements,
                duration,
                introduction_video_link
            };

            const updatedCourse = await prisma.course.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            res.status(200).json(updatedCourse);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Use the error handler
    app.use(errorHandler);
};
