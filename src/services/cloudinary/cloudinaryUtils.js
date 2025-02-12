const cloudinary = require("cloudinary").v2;

// Function to generate a signed URL for uploading
const generateSignedUrl = async (courseId) => {
    try {
        const folderPath = `courses/${courseId}/videos`;

        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder: folderPath },
            process.env.CLOUDINARY_API_SECRET
        );

        return {
            folder: folderPath,
            timestamp,
            signature,
            apiKey: process.env.CLOUDINARY_API_KEY,
        };
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw new Error("Could not generate signed URL");
    }
};

module.exports = {
    generateSignedUrl,
};
