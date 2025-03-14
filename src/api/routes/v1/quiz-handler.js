import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma Client and Prisma errors
import QuizService from '../../../services/quiz-service.js';
import { BadRequestError } from '../../../utils/app-errors.js'; // Change this import
import express from 'express';

const prisma = new PrismaClient(); // Instantiate Prisma Client

const service = new QuizService();
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Hello World quiz handler  service is responding ');
});


router.get('/:courseId/:sectionid/file', async (req, res, next) => {
    try {
        const { courseId, sectionid } = req.params;

        if (!courseId || !sectionid) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        const file = await service.getFileBySectionId(courseId, sectionid);
        res.status(200).json(file);
    } catch (err) {
        console.log("this is the error ", err);
        next(err);
    }
});


router.get('/:courseId/general-content', async (req, res, next) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        const courseContent = await service.getCourseById(courseId);
        res.status(200).json(courseContent);
    } catch (err) {
        console.log("this is the error ", err);
        next(err);
    }
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

export default router;

