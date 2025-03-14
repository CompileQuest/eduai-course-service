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
