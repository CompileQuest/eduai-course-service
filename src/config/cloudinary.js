import { v2 as cloudinary } from 'cloudinary';

console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Validate Cloudinary Connection
async function validateCloudinaryConnection() {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary is connected:', result);
    } catch (error) {
        console.error('❌ Cloudinary connection failed:', error.message);
    }
}

// Run the validation
validateCloudinaryConnection();

export { cloudinary };
