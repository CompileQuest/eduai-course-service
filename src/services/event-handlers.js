import UserService from "../services/user-service.js";

const userService = new UserService();

const eventHandlers = {
    "user.created": async (payload) => {
        console.log("Handling user.created event...");
        return await userService.createUser(payload);
    },
    "user.deleted": async (payload) => {
        console.log("Handling user.deleted event...");
        return await userService.deleteUser(payload.userId);
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
