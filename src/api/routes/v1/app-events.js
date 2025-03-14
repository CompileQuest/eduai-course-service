import express from "express";
import { handleEvent } from "../../../services/event-handler.js";
const router = express.Router();

// Expose a webhook for other services
router.post("/", async (req, res, next) => {
    try {
        const { type, payload } = req.body; // Extract event type and payload
        console.log(`Received event: ${type}`);

        const result = await handleEvent(type, payload);
        res.status(200).json({
            message: `Handled event: ${type}`,
            result,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
