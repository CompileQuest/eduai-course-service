import CourseService from "../../services/course-service.js";
import { RoutingKeys } from "./fireAndForget/settings/routingKeys.js";

class MessageHandler {
    constructor() {
        this.courseService = new CourseService();

        // Bind handlers
        this.handleCloudinaryUpload = this.handleCloudinaryUpload.bind(this);
        this.handleUserUpdated = this.handleUserUpdated.bind(this);
        this.handlePaymentProcessed = this.handlePaymentProcessed.bind(this);
        this.handleUnknownMessage = this.handleUnknownMessage.bind(this);

        this.handlers = {
            [RoutingKeys.CLOUDINARY_UPLOAD]: this.handleCloudinaryUpload,
            [RoutingKeys.PAYMENT_COMPLETED]: this.handlePaymentProcessed,
        };
    }

    async handleMessage(type, payload) {
        const handler = this.handlers[type] || this.handleUnknownMessage;
        return await handler(payload, type);
    }

    async handleCloudinaryUpload(payload, type) {
        try {
            console.log(`📤 [${type}] Cloudinary Upload Payload:`, payload);

            if (!payload || !payload.resource_type || !payload.original_filename) {
                console.error("❌ Invalid payload received:", payload);
                return { success: false, error: "Invalid payload structure", payload };
            }

            const { resource_type, format } = payload;

            if (resource_type === "video") {
                await this.courseService.SaveVideoToSection(payload);
            } else if (resource_type === "raw" || (resource_type === "image" && format === "pdf")) {
                await this.courseService.SaveFileToSection(payload);
            } else if (resource_type === "image") {
                // await this.courseService.SaveImageToSection(payload);
            } else {
                console.warn(`⚠️ Unsupported resource type: ${resource_type}`);
                return { success: false, error: "Unsupported resource type", payload };
            }

            return { success: true, message: "Cloudinary upload processed successfully", payload };
        } catch (error) {
            console.error(`🔥 [${type}] Error:`, error);
            return { success: false, error: "Internal server error", details: error.message };
        }
    }

    async handleUserUpdated(payload, type) {
        console.log(`👤 [${type}] User Updated:`, payload);
        return { success: true, message: `Handled ${type}`, payload };
    }

    async handlePaymentProcessed(payload, type) {
        console.log(`💳 [${type}] Payment Processed:`, payload);
        return { success: true, message: `Handled ${type}`, payload };
    }

    async handleUnknownMessage(payload, type) {
        console.warn(`❓ Unknown message type: ${type}`, payload);
        return { success: false, message: `Unknown message type: ${type}`, payload };
    }
}

export default MessageHandler;
