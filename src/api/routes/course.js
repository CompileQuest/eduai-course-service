const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client
const upload = require('../../middleware/upload');
const { authMiddleware } = require('../../middleware/auth.middleware');
const CourseService = require('../../services/course-service');
const AppError = require('../../utils/app-error'); // Change this import

module.exports = (app) => {
    const service = new CourseService();


    app.get("/test-error", async (req, res, next) => {
        console.log("hello");
        try {
            throw new BadRequestError("not good on this")
            res.status(200).send('<html><body><h1>user service is working</h1></body></html>');
        } catch (err) {
            next(err);
        }
    }); 




    app.get('/test-api-error', (req, res, next) => {
        next(new APIError("CustomError", STATUS_CODES.BAD_REQUEST, "This is a custom API error"));
    });


    app.get('/', (req, res) => {
        res.send('Hello World Cousre service is responding ');
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



    app.get('/courses/:id/content', async (req, res, next) => {
        try {
            const { id } = req.params;
            console.log("Fetching course content with id:", id);
            const courseContent = await service.FetchCourseContentById(id);
            res.status(200).json(courseContent);
        } catch (err) {
            //    console.log("form api layer");
            //  console.log(err);
            next(err); // Pass error to global error handler
        }
    });


    app.put('/courses/:id/sections/sorting', async (req, res, next) => {
        try {
            const { id } = req.params; // Get course ID from request parameters
            const { sections } = req.body; // Get sections from request body
            console.log("Updating sections sorting for course with id:", id);
            console.log("Sections:", sections);
            // Call the service method to update sections sorting (you need to implement this method in your CourseService)
            const updatedSections = await service.UpdateSectionsSorting(id, sections);
            res.status(200).json(updatedSections);
        } catch (err) {
            next(err);
        }
    });




};
