const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client
const { authMiddleware } = require('../../../middleware/auth.middleware');
const QuizService = require('../../../services/quiz-service');
const { BadRequestError } = require('../../../utils/app-error'); // Change this import
const express = require('express');


const service = new QuizService();
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Hello World quiz handler  service is responding ');
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

module.exports = router;

