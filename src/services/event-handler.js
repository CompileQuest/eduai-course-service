import { AppError, BadRequestError, InternalServerError } from "../utils/app-errors.js";
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
    },
    "user.owns.course": async (payload) => {
        try {
            console.log("Handling user owns course event...");

            console.log("this si the payload before it ", payload);
            // Check if payload is provided and valid
            if (!payload) {
                throw new BadRequestError("Invalid payload: Missing course data");
            }

            const { ownedCourses, userId } = payload;
            console.log("this is the owned courses ", ownedCourses);
            console.log("this is the user id ", userId);

            // Fetch the course information based on the course IDs
            const userCourses = await cousreService.getUserOwnedCourses(userId, ownedCourses);




            // Construct the success response
            const response = {
                success: true, // Indicates the operation was successful
                status: 200, // HTTP status code for success
                message: "User Courses retrieved successfully.", // Success message
                data: userCourses // The actual data (course info)
            };

            // Return the success response
            return response;

        } catch (error) {
            // Handle known errors (e.g., validation or business logic errors)
            if (error instanceof AppError) {
                console.error("Bad Request Error:", error.message);
                throw error;  // Rethrow the BadRequestError to notify the caller
            }

            // Handle unexpected errors (e.g., database or network issues)
            console.error("Unexpected error while processing the event", error);
            throw new InternalServerError("An unexpected error occurred while processing the event", error.message);
        }
    }
    ,
    "course.bookmark.info": async (payload) => {
        try {
            console.log("Handling user course bookmark info ...");

            console.log("this is the payload ", payload);
            // Check if payload is provided and valid
            if (!payload) {
                throw new BadRequestError("Invalid payload: Missing course data");
            }

            const { courseId } = payload.data;


            // Fetch the course information based on the course IDs
            const cousreBookmarkInfo = await cousreService.getUserBookmarkCourse(courseId);




            // Construct the success response
            const response = {
                success: true, // Indicates the operation was successful
                status: 200, // HTTP status code for success
                message: "User Bookmark course fetched successfully.", // Success message
                data: cousreBookmarkInfo // The actual data (course info)
            };

            // Return the success response
            return response;

        } catch (error) {
            // Handle known errors (e.g., validation or business logic errors)
            if (error instanceof AppError) {
                console.error("Bad Request Error:", error.message);
                throw error;  // Rethrow the BadRequestError to notify the caller
            }

            // Handle unexpected errors (e.g., database or network issues)
            console.error("Unexpected error while processing the event", error);
            throw new InternalServerError("An unexpected error occurred while processing the event", error.message);
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
        console.log("this is the payload ", payload);
        return await eventHandlers[eventType](payload);
    } else {
        console.warn(`No handler found for event: ${eventType}`);
        return null;
    }
};
