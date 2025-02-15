const cloudinary = require("cloudinary").v2;

class CloudinaryService {
    constructor() {
        // Initialize any necessary properties or dependencies here
    }

    //done
    async generateSignedUploadUrlVideo(courseId, title) {
        try {
            const folderPath = `courses/${courseId}/videos`;
            const timestamp = Math.round(new Date().getTime() / 1000);

            // Prepare the context string
            const context = `title=${title}|courseId=${courseId}`;

            // Include context in the signature calculation
            const signature = cloudinary.utils.api_sign_request(
                {
                    timestamp,
                    folder: folderPath,
                    context: context, // Include context in the signature payload
                },
                process.env.CLOUDINARY_API_SECRET
            );

            return {
                folder: folderPath,
                timestamp,
                signature,
                apiKey: process.env.CLOUDINARY_API_KEY,
                context: context, // Return context to the frontend
            };
        } catch (error) {
            console.error("Error generating signed URL:", error);
            throw new Error("Could not generate signed URL");
        }
    }
}

module.exports = CloudinaryService;