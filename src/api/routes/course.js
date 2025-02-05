const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client
const upload = require('../../middleware/upload');
const { authMiddleware } = require('../../middleware/auth.middleware');
const CourseService = require('../../services/course-service');

module.exports = (app) => {
    const service = new CourseService();

    app.get('/testing', (req, res) => {
        res.send('Hello World');
    });

    app.get('/categories', async (req, res, next) => {
        try {
            const categories = await service.FetchCategories();

            console.log("sending back categories");
            return res.status(200).json(categories);
        } catch (error) {
            next(error);
        }
    });


    app.post('/courses/create-course-template',
        authMiddleware,
        upload.single('thumbnail'),
        async (req, res, next) => {
            try {
                // Now you can access the authenticated user via req.user
                console.log('Authenticated user:', req.user);
                console.log('Request body:', req.body);
                console.log('Uploaded file:', req.file);

                const form = req.body
                const image = req.file;

                const courseTemplate = await service.createCourseTemplate(form, image);
                console.log("courseTemplate done");
                res.status(201).json(courseTemplate);

            } catch (err) {
                next(err);
            }
        }
    );

    app.get('/courses/draft-courses', async (req, res, next) => {
        try {
            const courseTemplate = await service.FetchCourseTemplate();
            res.status(200).json(courseTemplate);
        } catch (err) {
            next(err);
        }
    });


    app.delete('/courses/delete-course/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            console.log("Deleting course with id:", id);
            const deletedCourse = await service.DeleteCourseById(id);
            res.status(200).json({ message: 'Course deleted', deletedCourse });
        } catch (err) {
            next(err);
        }
    });


    app.get('/courses/draft-courses/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            console.log("Fetching course with id:", id);
            const course = await service.FetchCourseTemplateById(id);
            res.status(200).json(course);
        } catch (err) {
            next(err);
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

};
