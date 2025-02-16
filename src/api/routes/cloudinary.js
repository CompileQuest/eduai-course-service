const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client
const upload = require('../../middleware/upload');
const { authMiddleware } = require('../../middleware/auth.middleware');
const CloudinaryService = require('../../../scripts/cloudinaryUtils');
const validate = require('../../middleware/validate');
const { videoUploadedSchema } = require('../../validation/cloudinaryValidation');

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
        try {
            const result = await service.generateSignedUploadUrlVideo(courseId, title); // Pass title to the service method
            res.status(200).json({ message: "Signed URL generated successfully", result });
        } catch (err) {
            next(err);
        }
    });




    // Updated route to return a simple Hello World message
    app.get(
        "/cloudinary/webhook/video-uploaded",
        validate(videoUploadedSchema), // Use validation middleware
        async (req, res, next) => {
            try {
                const timestamp = req.headers["x-cld-timestamp"];
                const signature = req.headers["x-cld-signature"];
                const payload = req.body; // Already validated!

                await videoController.processVideoUploadFromCloudinaryNotification(timestamp, signature, payload);
                res.status(200).json({ message: "Webhook received successfully!" });
            } catch (err) {
                next(err);
            }
        }
    );
};
