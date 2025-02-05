const cloudinary = require('../config/cloudinary');

const uploadVideo = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "course-videos",
                resource_type: "video",
                eager: [
                    { format: "mp4", quality: "auto" },
                    { format: "webm", quality: "auto" }
                ],
                eager_async: true,
                chunk_size: 6000000 // 6MB chunks
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

module.exports = {
    uploadVideo
}; 