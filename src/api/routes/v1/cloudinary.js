const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client
const upload = require('../../../middleware/upload');
const { authMiddleware } = require('../../../middleware/auth.middleware');
const CloudinaryService = require('../../../services/cloudinary/cloudinaryUtils');
const validate = require('../../../middleware/validate');
const { videoUploadedSchema } = require('../../../validation/cloudinaryValidation');
const { APIError, InternalServerError, BadRequestError, ForbiddenError, AppError, NotFoundError } = require('../../../utils/app-error')
const express = require('express');

const service = new CloudinaryService();
const router = express.Router();

router.get('/testing', async (req, res, next) => {
    try {
        res.status(200).json({ message: 'Cloudinary testing' });
    } catch (err) {
        next(err);
    }
});

// Updated route to get Cloudinary signed URL using the service layer
router.get('/signed-upload-url-video', async (req, res, next) => {
    const { courseId, sectionId, title } = req.query; // Extract title from req.query
    try {
        const result = await service.generateSignedUploadUrlVideo(courseId, sectionId, title); // Pass title to the service method
        res.status(200).json({ message: "Signed URL generated successfully", result });
    } catch (err) {
        next(err);
    }
});


// Updated route to get Cloudinary signed URL using the service layer
router.get('/:courseId/signed-upload-url-file', async (req, res, next) => {
    const { courseId } = req.params;
    const { sectionId, title, isFree } = req.body; // Extract title from req.query
    const instructorId = "uuid_here_of_instructor_test"; // Temporary for testing
    try {
        // Simple validation using your custom error handling
        if (!sectionId || !instructorId || !title || !isFree) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        // move the cloudinary to course service and make it accessible from there and do check like owner ships and all !!
        const result = await service.generateSignedUploadUrlFile(courseId, sectionId, title, isFree); // Pass title to the service method
        res.status(200).json({ message: "Signed URL generated successfully", result });
    } catch (err) {
        next(err);
    }
});



// Updated route to return a simple Hello World message
router.post(
    "/webhook/video-uploaded", // Use validation middleware 
    async (req, res, next) => {
        try {
            const timestamp = req.headers["x-cld-timestamp"];
            const signature = req.headers["x-cld-signature"];
            const payload = req.body; // Already validated!
            console.log("this is the payload", payload);
            if (payload.resource_type === "video") {
                console.log("Video uploaded:");
                // Save to video database
                await service.processVideoUploadFromCloudinaryNotification(timestamp, signature, payload);
            } else if (payload.resource_type === "raw") {
                console.log("File uploaded:");
                // Save to file database (PDFs, ZIPs, etc.)
                await service.processFileUploadFromCloudinaryNotification(timestamp, signature, payload);

            }
            res.status(200).json({ message: "Webhook received successfully!" }); // Acknowledgment message
        } catch (err) {
            next(err);
        }
    }
);



module.exports = router;
