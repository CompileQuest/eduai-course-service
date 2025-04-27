import { cloudinary } from '../../config/cloudinary.js';

async function uploadImage(fileBuffer, folder = 'default', fileName) {
    try {
        if (!fileBuffer) throw new Error('No file provided');

        if (!Buffer.isBuffer(fileBuffer)) throw new Error('Invalid file format: File must be a Buffer');

        if (!fileName) throw new Error('No file name provided');

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    public_id: fileName,  // 👈 This is the important part
                    overwrite: true,      // 👈 Optional: if you want to replace old images with the same name
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(fileBuffer);
        });

        return {
            url: result.secure_url,
            public_id: result.public_id,
        };

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary: ' + error.message);
    }
}


export { uploadImage };