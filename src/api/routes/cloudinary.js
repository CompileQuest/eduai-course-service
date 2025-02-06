const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client
const upload = require('../../middleware/upload');
const { authMiddleware } = require('../../middleware/auth.middleware');
const CourseService = require('../../services/course-service');
const { generateSignedUrl } = require('../../services/cloudinary/cloudinaryUtils'); // Import the new function

module.exports = (app) => {
    const service = new CourseService();

    app.get('/cloudinary/testing', async (req, res, next) => {
        try {
            res.status(200).json({ message: 'Cloudinary testing' });
        } catch (err) {
            next(err);
        }
    });

    // Updated route to get Cloudinary signed URL using the service layer
    app.get('/cloudinary/signed-url-video', async (req, res, next) => {
        const { courseId } = req.body;
        console.log(courseId);
        try {
            const result = await generateSignedUrl(courseId, "video");
            res.status(200).json({ message: "Signed URL generated successfully", result });
        } catch (err) {
            next(err);
        }
    });
};
