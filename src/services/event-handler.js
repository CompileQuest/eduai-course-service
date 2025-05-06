import CourseService from "../services/course-service.js";
import CousreService from "../services/course-service.js";
const cousreService = new CousreService();

const eventHandlers = {
    "cousre.created": async (payload) => {
        console.log("Handling user.created event...");
        return await cousreService.AddUser(payload);
    },
    "cousre.deleted": async (payload) => {
        console.log("Handling user.deleted event...");
        return await cousreService.deleteUser(payload.userId);
    },
    "course.cart.info": async (payload) => {
        console.log("Handling course cart info event", payload);

        try {
            const courseArray = payload.data;
            const courseInfo = await cousreService.getCousreCartInfo(courseArray);

            return {
                success: true,
                message: "Successfully fetched the course info for the cart",
                statusCode: 200,
                data: courseInfo
            };
        } catch (error) {
            console.error("Error in course.cart.info handler:", error);

            return {
                success: false,
                message: "Failed to fetch course info for the cart",
                statusCode: error?.statusCode || 500,
                error: error.message || "Internal Server Error"
            };
        }
    }

    // Add more event handlers as needed
};



/**
 * Resolves the appropriate handler for a given event type.
 * @param {string} eventType - The event type (e.g., "user.created").
 * @param {object} payload - The event payload.
 */
export const handleEvent = async (eventType, payload) => {
    if (eventHandlers[eventType]) {
        return await eventHandlers[eventType](payload);
    } else {
        console.warn(`No handler found for event: ${eventType}`);
        return null;
    }
};
