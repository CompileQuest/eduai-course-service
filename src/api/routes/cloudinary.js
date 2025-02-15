const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client
const upload = require('../../middleware/upload');
const { authMiddleware } = require('../../middleware/auth.middleware');
const CloudinaryService = require('../../services/cloudinary/cloudinaryUtils');

module.exports = (app) => {
    const service = new CloudinaryService();

    app.get('/cloudinary/testing', async (req, res, next) => {
        try {
            res.status(200).json({ message: 'Cloudinary testing' });
        } catch (err) {
            next(err);
        }
    });

    // Updated route to get Cloudinary signed URL using the service layer
    app.get('/cloudinary/signed-upload-url-video', async (req, res, next) => {
        const { courseId, title } = req.query; // Extract title from req.query
        console.log(courseId, title, ' this is the course id and title in the backend');

        try {
            const result = await service.generateSignedUploadUrlVideo(courseId, title); // Pass title to the service method
            res.status(200).json({ message: "Signed URL generated successfully", result });
        } catch (err) {
            next(err);
        }
    });



    // Updated route to get Cloudinary signed URL using the service layer
    app.get('/cloudinary/content-uploaded', async (req, res, next) => {
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
