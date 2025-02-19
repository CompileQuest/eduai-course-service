const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client
const upload = require('../../../middleware/upload');
const { authMiddleware } = require('../../../middleware/auth.middleware');
const CourseService = require('../../../services/course-service');
const { BadRequestError } = require('../../../utils/app-error'); // Change this import
const express = require('express');
const { ServerDescriptionChangedEvent } = require('mongodb');


const service = new CourseService();
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Hello World Cousre service is responding ');
});

router.get("/test-error", async (req, res, next) => {
    console.log("hello");
    try {
        throw new BadRequestError("not good on this")
        res.status(200).send('<html><body><h1>user service is working</h1></body></html>');
    } catch (err) {
        next(err);
    }
});




router.get('/test-api-error', (req, res, next) => {
    next(new APIError("CustomError", STATUS_CODES.BAD_REQUEST, "This is a custom API error"));
});




router.get('/categories', async (req, res, next) => {
    try {
        const categories = await service.FetchCategories();

        console.log("sending back categories");
        return res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
});


router.post('/courses/create-course-template',
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



router.put('/courses/:courseId/thumbnail-upload', authMiddleware,
    upload.single('thumbnail'), async (req, res, next) => {
        try {
            const { courseId } = req.params;
            const image = req.file;
            console.log("this is the course id  ", courseId);
            console.log("this is the imaeg ", image);

            const course = await service.updateThumbNail(courseId, image);
            res.status(200).json(course);
        } catch (err) {
            next(err);
        }
    });


router.get('/courses/draft-courses', async (req, res, next) => {
    try {
        const courseTemplate = await service.FetchCourseTemplate();
        res.status(200).json(courseTemplate);
    } catch (err) {
        next(err);
    }
});


router.delete('/courses/delete-course/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("Deleting course with id:", id);
        const deletedCourse = await service.DeleteCourseById(id);
        res.status(200).json({ message: 'Course deleted', deletedCourse });
    } catch (err) {
        next(err);
    }
});


router.get('/courses/draft-courses/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("Fetching course with id:", id);
        const course = await service.FetchCourseTemplateById(id);
        res.status(200).json(course);
    } catch (err) {
        next(err);
    }
});







router.get('/courses/:id/content', async (req, res, next) => {
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


router.put('/courses/:id/sections/sorting', async (req, res, next) => {
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


router.put('/courses/:id/sections/videos/sorting', async (req, res, next) => {
    try {
        const { id } = req.params; // Get course ID from request parameters
        const { sections } = req.body; // Get sections from request body
        console.log("Updating sections sorting for course with id:", id);
        console.log("i am called here ");
        // Log the full structure of sections
        // console.dir(sections, { depth: null, colors: true });

        // Call the service method to update sections sorting (you need to implement this method in your CourseService)
        const updatedSections = await service.UpdateVideoSorting(id, sections);
        res.status(200).json(updatedSections);
    } catch (err) {
        next(err);
    }
});

router.post('/courses/:cousreId/addSection', async (req, res, next) => {
    try {
        const { cousreId } = req.params; // Get course ID from request parameters
        const { title } = req.body; // Get sections from request body
        console.log("the id of the course id ", cousreId);
        console.log("the title of the course id ", title);
        // Log the full structure of sections
        // console.dir(sections, { depth: null, colors: true });

        // Call the service method to update sections sorting (you need to implement this method in your CourseService)
        const addedSection = await service.addSection(cousreId, title);
        res.status(200).json(addedSection);
    } catch (err) {
        next(err);
    }
});

router.get('/:cousreId/preview', async (req, res, next) => {
    try {
        const { cousreId } = req.params; // Get course ID from request parameters

        // Call the service method to update sections sorting (you need to implement this method in your CourseService)
        const coursePreview = await service.getCoursePreview(cousreId);
        res.status(200).json(coursePreview);
    } catch (err) {
        next(err);
    }
});


router.delete('/:courseId/deleteSection', async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { sectionId } = req.body;
        const instructorId = "uuid_here_of_instructor_test"; // Temporary for testing

        // Simple validation using your custom error handling
        if (!courseId || !sectionId || !instructorId) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        // Call the service method to delete the section
        const deletedSection = await service.deleteSectionById(courseId, sectionId, instructorId);
        res.status(200).json(deletedSection);
    } catch (err) {
        console.log("this is the error ", err);
        next(err); // Passes error to centralized error handling middleware
    }
});


router.put('/:courseId/editSection', async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { sectionId, title } = req.body;
        const instructorId = "uuid_here_of_instructor_test"; // Temporary for testing

        // Simple validation using your custom error handling
        if (!sectionId || !instructorId || !title) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        // Call the service method to delete the section
        const editedSection = await service.editSection(courseId, sectionId, instructorId, title);
        res.status(200).json(editedSection);
    } catch (err) {
        console.log("this is the error ", err);
        next(err); // Passes error to centralized error handling middleware
    }
});


router.delete('/:courseId/deleteVideo', async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { videoId } = req.body;
        const instructorId = "uuid_here_of_instructor_test"; // Temporary for testing

        // Simple validation using your custom error handling
        if (!courseId || !instructorId || !videoId) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        // Call the service method to delete the section
        const videoDeleted = await service.deleteVideo(courseId, instructorId, videoId);
        res.status(200).json(videoDeleted);
    } catch (err) {
        console.log("this is the error ", err);
        next(err); // Passes error to centralized error handling middleware
    }
});


module.exports = router;

