const cloudinary = require("cloudinary").v2;
const CourseRepository = require('../../database/repository/course-repository')
class CloudinaryService {
    constructor() {
        this.repository = new CourseRepository();
    }

    //done
    async generateSignedUploadUrlVideo(courseId, sectionId, title) {
        try {
            const folderPath = `courses/${courseId}/videos`;
            const timestamp = Math.round(new Date().getTime() / 1000);

            // Prepare the context string from title,courseid,sectoinid !!
            const context = `title=${title}|courseId=${courseId}|sectionId=${sectionId}`;

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



    async processVideoUploadFromCloudinaryNotification(timestamp, signature, payload) {
        try {
            // verify here the signature and why here ? because its related to the business layer

            // it only applies to cloudinary in our case thats why its done here and not in the routing level or in the middlewares
            const result = this.repository.SaveVideoToSection(payload);
            return result;
        } catch (error) {
            console.error("Error processing the video upload from cloudinary", error);
            throw new Error("Could not generate signed URL");
        }
    }
}

module.exports = CloudinaryService;
