const { z } = require('zod')
/**
 * 🔹 Validation for "video-uploaded" webhook
 */
const videoUploadedSchema = z.object({
    asset_id: z.string(),
    request_id: z.string().optional(),
    public_id: z.string(),
    secure_url: z.string().url(),
    playback_url: z.string().url().optional(),
    sectionId: z.string(),
    title: z.string().optional(),
    format: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    duration: z.number().optional(),
    bitRate: z.number().optional(),
    frameRate: z.number().optional(),
    folder: z.string().optional(),
    audioCodec: z.string().optional(),
    videoCodec: z.string().optional(),
    video_profile: z.string().optional(),
    notification_type: z.string(),
    original_filename: z.string().optional(),
});

/**
 * 🔹 Validation for "video-deleted" webhook
 */
const videoDeletedSchema = z.object({
    asset_id: z.string(),
    public_id: z.string(),
    notification_type: z.string().refine((val) => val === "delete", {
        message: "Notification type must be 'delete'",
    }),
});

/**
 * 🔹 Validation for "video-processing" webhook
 */
const videoProcessingSchema = z.object({
    asset_id: z.string(),
    public_id: z.string(),
    secure_url: z.string().url().optional(),
    notification_type: z.string().refine((val) => val === "processing", {
        message: "Notification type must be 'processing'",
    }),
});

module.exports = {
    videoUploadedSchema,
    videoDeletedSchema,
    videoProcessingSchema,
};
