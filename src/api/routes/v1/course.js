

import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma Client and Prisma errors
import upload from '../../../middleware/upload.js';

import CourseService from '../../../services/course-service.js';
import tokenManipulator from "../../../middleware/tokenManipulator.js";
import { BadRequestError, STATUS_CODES } from '../../../utils/app-errors.js'; // Change this import
import express from 'express';
import { ServerDescriptionChangedEvent } from 'mongodb';
import { checkRole, getUserId, getCurrentRole, checkAuth } from '../../../middleware/auth/authHelper.js';
import roles from '../../../config/roles.js';
import ROLES from '../../../config/roles.js';
import { check } from 'prisma';

const prisma = new PrismaClient(); // Instantiate Prisma Client
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


router.post('/courses/getLandingPageCourses',
    async (req, res, next) => {
        try {

            const filter = req.body;


            const FilteredCourses = await service.getLandingPageCourses(filter);

            res.status(201).json(FilteredCourses);
        } catch (err) {
            next(err);
        }
    }
);


router.post('/courses/create-course-template',
    upload.single('thumbnail'),
    checkAuth,
    checkRole([roles.INSTRUCTOR]),
    async (req, res, next) => {
        try {
            // Now you can access the authenticated user via req.user
            console.log('Authenticated user:', req.user);
            console.log('Request body:', req.body);
            console.log('Uploaded file:', req.file);
            const instructorId = getUserId(req.auth, 'INSTRUCTOR');
            console.log("this is the instructor id  ", instructorId);
            const form = req.body
            const image = req.file;

            const courseTemplate = await service.createCourseTemplate(form, image, instructorId);
            console.log("courseTemplate done");
            res.status(201).json({
                sucess: true,
                message: "Course template created successfully",
                courseTemplate: courseTemplate
            });

        } catch (err) {
            next(err);
        }
    }
);

router.put('/edit-course/:courseId',
    upload.single('thumbnail'),
    checkAuth,
    checkRole([roles.INSTRUCTOR]),
    async (req, res, next) => {
        try {
            // Access the authenticated user via req.user
            console.log('Authenticated user:', req.user);
            console.log('Request body:', req.body);
            console.log('Uploaded file:', req.file);

            const instructorId = getUserId(req.auth, 'INSTRUCTOR');
            console.log("Instructor ID:", instructorId);

            const { courseId } = req.params; // Get courseId from the route parameter
            const form = req.body;

            // Call the service method to update the course template
            const updatedCourseTemplate = await service.updateCourse(instructorId, courseId, form);
            console.log("Course template updated");

            // Respond with the updated course template
            res.status(200).json({
                success: true,
                message: "Course template updated successfully",
                courseTemplate: updatedCourseTemplate
            });
        } catch (err) {
            next(err);
        }
    }
);



router.get('/courses/production/:courseId', async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = getUserId(req.auth, ROLES.STUDENT);
        const userRole = getCurrentRole(req.auth);
        console.log("this is the user id  ", userId);
        console.log("this is the user role  ", userRole);
        console.log("this is the course id  ", courseId);

        const course = await service.FetchCourseProductionById(courseId, userId, userRole);
        res.status(200).json(course);
    } catch (err) {
        next(err);
    }
});


router.put('/courses/:courseId/thumbnail-upload',
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


router.get('/instructor-courses', async (req, res, next) => {
    try {
        // const tempUserId = getUserId(req.auth);
        //console.log("the user id is ", tempUserId);
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10);
        const instructorId = getUserId(req.auth, 'INSTRUCTOR');
        if (isNaN(page) || isNaN(limit)) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        const courses = await service.FetchCoursesPaginated(instructorId, page, limit);
        res.status(200).json(courses);
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




router.post('/courses/getFilterCoursesPaginated', async (req, res, next) => {
    try {
        const paginationParams = req.body;
        console.log("this is the paginatoin params ", paginationParams)
        const page = parseInt(paginationParams.page, 10);
        const limit = parseInt(paginationParams.limit, 10);
        const categoriesArray = paginationParams.categories;
        const levelsArray = paginationParams.levels;
        const rating = paginationParams.rating;
        const sortByPoliciy = paginationParams.sortBy;
        console.log("this is the page params ", page)
        console.log("this is the limit params ", limit)
        console.log("this is the categories params ", categoriesArray)
        console.log("this is the levels params ", levelsArray)
        console.log("this is the rating params ", rating)
        console.log("this is the sortBy params ", sortByPoliciy)
        if (isNaN(page) || isNaN(limit)) {
            throw new BadRequestError("Invalid or missing inputs field");
        }
        if (!categoriesArray || !levelsArray || !sortByPoliciy) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        const courses = await service.getFilterCoursesPaginated(page, limit, categoriesArray, levelsArray, rating, sortByPoliciy);
        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
});


router.get('/:courseId/content', async (req, res, next) => {
    try {
        const { courseId } = req.params;
        console.log("Fetching course content with id:", courseId);
        const courseContent = await service.FetchCourseContentById(courseId);
        res.status(200).json(courseContent);
    } catch (err) {
        //    console.log("form api layer");
        //  console.log(err);
        next(err); // Pass error to global error handler
    }
});

router.get('/courses/related-courses/', async (req, res, next) => {
    try {
        const { courseId } = req.query;
        console.log("Fetching related courses to this id :", courseId);
        const relatedCourses = await service.fetchRelatedCourses(courseId);
        res.status(200).json(relatedCourses);
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


router.put('/courses/:courseId/sections/videos/sorting', async (req, res, next) => {
    try {
        const { courseId } = req.params; // Get course ID from request parameters
        const { sections } = req.body; // Get sections from request body
        console.log("Updating sections sorting for course with id:", courseId);
        console.dir(sections, { depth: null, colors: true });

        // Call the service method to update sections sorting (you need to implement this method in your CourseService)
        const updatedSections = await service.UpdateVideoSorting(courseId, sections);
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


router.delete('/:courseId/deleteSection', checkAuth, checkRole([ROLES.ADMIN, ROLES.INSTRUCTOR]), async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { sectionId } = req.query; // Get sectionId from query parameters
        const instructorId = getUserId(req.auth, 'INSTRUCTOR'); // Get instructorId from the request

        console.log("this is the course id ", courseId);
        console.log("this is the section id ", sectionId);
        console.log("this is the instructor id ", instructorId);


        if (!courseId || !sectionId || !instructorId) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        const deletedSection = await service.deleteSectionById(courseId, sectionId, instructorId);
        res.status(200).json(deletedSection);
    } catch (err) {
        console.log("this is the error ", err);
        next(err);
    }
});


router.put('/:courseId/editSection', async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { sectionId, title } = req.body;
        const instructorId = getUserId(req.auth, 'INSTRUCTOR'); // Get instructorId from the request    


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


router.get('/:courseId/getSectionFiles', checkAuth, checkRole([ROLES.INSTRUCTOR]), async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const instructorId = getUserId(req.auth, 'INSTRUCTOR'); // Get instructorId from the request    


        if (!courseId || !instructorId) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        // Call the service method to delete the section
        const sectionFiles = await service.getSectionFiles(courseId, instructorId);
        res.status(200).json({
            success: true,
            message: "Fetched  Section Files Successfuly",
            data: sectionFiles
        });
    } catch (err) {
        console.log("this is the error ", err);
        next(err); // Passes error to centralized error handling middleware
    }
});


router.delete('/:courseId/deleteVideo', async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { videoId } = req.query;
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



router.put('/:courseId/editVideo', async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { videoId, title, isFree } = req.body;
        const instructorId = "uuid_here_of_instructor_test"; // Temporary for testing

        // Simple validation using your custom error handling
        if (!courseId || !instructorId || !videoId || !title || !isFree) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        // Call the service method to delete the section
        const videoDeleted = await service.editVideo(courseId, instructorId, videoId, { title, isFree });
        res.status(200).json(videoDeleted);
    } catch (err) {
        console.log("this is the error ", err);
        next(err); // Passes error to centralized error handling middleware
    }
});




router.get('/:courseId/get-quizes', async (req, res, next) => {
    try {
        const { courseId } = req.params;

        // Simple validation using your custom error handling
        if (!courseId) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        // Call the service method to delete the section
        const sectionWithCourses = await service.getSectionTemp(courseId);
        res.status(200).json(sectionWithCourses);
    } catch (err) {
        console.log("this is the error ", err);
        next(err); // Passes error to centralized error handling middleware
    }
});














export default router;

