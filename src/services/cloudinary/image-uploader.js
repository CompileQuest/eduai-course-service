import { cloudinary } from '../../config/cloudinary.js';

async function uploadImage(fileBuffer, folder = 'default') {
    try {
        if (!fileBuffer) {
            throw new Error('No file provided');
        }


        // Add basic file validation
        const fileData = fileBuffer;
        if (!Buffer.isBuffer(fileData)) {
            throw new Error('Invalid file format: File must be a Buffer');
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: folder,
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });

            uploadStream.end(fileData);
        });

        return {
            url: result.secure_url,
            public_id: result.public_id,
        };

    } catch (error) {
        // More specific error handling
        if (error.message.includes('No file provided')) {
            throw error;
        }
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary: ' + error.message);
    }
}

export { uploadImage };