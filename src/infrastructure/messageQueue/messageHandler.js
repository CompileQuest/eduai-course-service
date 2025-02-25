const CourseService = require("../../services/course-service");

class MessageHandler {
    constructor() {
        this.courseService = new CourseService();

        // Bind methods to preserve `this` context
        this.handleCloudinaryUpload = this.handleCloudinaryUpload.bind(this);
        this.handleUserUpdated = this.handleUserUpdated.bind(this);
        this.handlePaymentProcessed = this.handlePaymentProcessed.bind(this);
        this.handleUnknownMessage = this.handleUnknownMessage.bind(this);

        // Define the mapping of message types to handler functions
        this.handlers = {
            cloudinary_upload: this.handleCloudinaryUpload,
            user_updated: this.handleUserUpdated,
            payment_processed: this.handlePaymentProcessed,
            unknown: this.handleUnknownMessage, // Explicit handler for unknown messages
        };
    }

    // Main method to process messages and return a response
    async handleMessage(messageType, payload) {
        const handler = this.handlers[messageType] || this.handlers.unknown;
        return await handler(payload, messageType); // Pass message type for unknown cases
    }

    // Handler functions (all return a response)
    async handleCloudinaryUpload(payload) {
        try {
            console.log("📥 Received cloudinary_upload message:");

            // Validate required fields before proceeding
            if (!payload || !payload.resource_type || !payload.original_filename) {
                console.error("❌ Invalid payload received:", payload);
                return { success: false, error: "Invalid payload structure", payload };
            }

            if (payload.resource_type === "video") {
                console.log("🎥 Video uploaded:", payload.original_filename);

                await this.courseService.SaveVideoToSection(payload);
                console.log("✅ Video successfully saved to the section.");
            }
            else if (payload.resource_type === "raw") {
                console.log("📂 File uploaded:", payload.original_filename);
                console.log("THIS IS THE FILE CONTENT ", payload);
                await this.courseService.SaveFileToSection(payload);
                console.log("📂 File saved :", payload.original_filename);



            }
            else {
                console.warn(`⚠️ Unsupported resource type: ${payload.resource_type}`);
                return { success: false, error: "Unsupported resource type", payload };
            }

            return { success: true, message: "Cloudinary upload processed successfully", payload };

        } catch (error) {
            console.error("🔥 Error processing cloudinary_upload:", error);
            return { success: false, error: "Internal server error", details: error.message };
        }
    }

    async handleUserUpdated(payload) {
        console.log("Processing user_updated message:", payload);
        return { success: true, message: "User update processed", payload };
    }

    async handlePaymentProcessed(payload) {
        console.log("Processing payment_processed message:", payload);
        return { success: true, message: "Payment processed successfully", payload };
    }

    async handleUnknownMessage(payload, messageType) {
        console.warn(`Unknown message type received: ${messageType}`, payload);
        return { success: false, message: `Unknown message type: ${messageType}`, payload };
    }
}

module.exports = MessageHandler;
