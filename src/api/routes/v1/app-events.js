import express from "express";
import { handleEvent } from "../../../services/event-handler.js";
import { STATUS_CODES } from "../../../utils/app-errors.js";
const router = express.Router();

// Expose a webhook for other services
router.post("/", async (req, res, next) => {
    try {
        const { type, payload } = req.body; // Extract event type and payload
        const hello = req.body;


        console.log("this is the message ", hello);
        console.log(`Received event: ${type}`);


        const result = await handleEvent(type, payload);
        res.status(200).json({
            success: result.success,
            message: `Handled event: ${type}`,
            data: result.data
        });


    } catch (error) {
        next(error);
    }
});


export default router;
