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


    async generateSignedUploadUrlFile(courseId, sectionId, title, isFree) {
        try {
            const folderPath = `courses/${courseId}/files`;
            const timestamp = Math.round(new Date().getTime() / 1000);

            // Prepare the context string from title,courseid,sectoinid !!
            const context = `title=${title}|courseId=${courseId}|sectionId=${sectionId}|isFree=${isFree}`;

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

    async processFileUploadFromCloudinaryNotification(timestamp, signature, payload) {
        try {

            return result;
        } catch (error) {
            console.error("Error processing the video upload from cloudinary", error);
            throw new Error("Could not generate signed URL");
        }
    }



    async processFileUploadFromCloudinaryNotification(timestamp, signature, payload) {
        try {
            console.log("Received Cloudinary webhook:", payload);

            // ✅ 1️⃣ Verify Cloudinary Signature (Security Check)
            const expectedSignature = crypto
                .createHash("sha256")
                .update(`timestamp=${timestamp}${this.cloudinaryApiSecret}`)
                .digest("hex");

            if (expectedSignature !== signature) {
                throw new Error("Invalid Cloudinary signature");
            }

            // ✅ 2️⃣ Validate Upload Type
            const { public_id, secure_url, resource_type, format, bytes } = payload;

            if (!["image", "video", "raw"].includes(resource_type)) {
                throw new Error(`Unsupported file type: ${resource_type}`);
            }

            console.log(`Processing uploaded ${resource_type}: ${secure_url}`);

            // ✅ 3️⃣ Perform Security Checks (Optional)
            if (bytes > 100 * 1024 * 1024) { // 100MB limit
                throw new Error("File size too large");
            }

            // (Optional) Download file for deep security scanning
            if (resource_type === "raw" || resource_type === "video") {
                await this.scanFileForMalware(secure_url);
            }

            // ✅ 4️⃣ Store File Info in Database
            const fileData = {
                public_id,
                url: secure_url,
                type: resource_type,
                format,
                size: bytes,
                uploaded_at: new Date()
            };
            await saveToDatabase(fileData); // Assume this function saves to your DB

            console.log("Upload processed successfully:", fileData);
            return fileData;

        } catch (error) {
            console.error("Error processing the upload from Cloudinary", error);
            throw new Error("File processing failed");
        }
    }

    // a function to process the file and check it  for security or something  
    // if file is comprimised of threat then flag the user
    async scanFileForMalware(fileUrl) {
        try {
            console.log("Downloading file for scanning:", fileUrl);

            // Download the file (Caution: Large files can overload your backend)
            const response = await axios.get(fileUrl, { responseType: "arraybuffer" });

            // Here, you could use a virus scanner API like ClamAV, VirusTotal, etc.
            console.log("File downloaded successfully, scanning...");

            // For now, just log the file size
            console.log("File size for scanning:", response.data.length, "bytes");

        } catch (error) {
            console.error("Error downloading file for scanning", error);
        }
    }

}

module.exports = CloudinaryService;
