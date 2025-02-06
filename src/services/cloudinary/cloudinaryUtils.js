const { cloudinary } = require("../../config/cloudinary");

// Function to generate a signed URL for uploading
const generateSignedUrl = (courseId, resourceType) => {
    // Ensure Cloudinary is configured
    if (!cloudinary.config().cloud_name) {
        throw new Error("Cloudinary configuration is missing.");
    }

    // Define the folder where the file will be uploaded
    const folder = `courses/${courseId}/videos`;

    // Set expiration timestamp (1 hour from now)
    const timestamp = Math.floor(Date.now() / 1000) + 3600;

    // Construct the upload URL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/${resourceType}/upload`;

    // Return only the necessary data for the frontend
    return {
        url: uploadUrl,
        timestamp: timestamp,
        folder: folder,
    };
};

module.exports = {
    generateSignedUrl,
};
