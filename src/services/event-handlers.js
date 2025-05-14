// import CourseService from "../services/course-service.js";
// import { APIError, AppError, BadRequestError, NotFoundError } from "../utils/app-errors.js"; // Assuming you have these custom error classes
// const cousreService = new CourseService();

// const eventHandlers = {
//     "cousreInfo.cart": async (payload) => {
//         try {
//             console.log("Handling cousreInfo.cart event...");

//             // Check if payload is provided and valid
//             if (!payload || !payload.data) {
//                 throw new BadRequestError("Invalid payload: Missing course data");
//             }

//             const cousreIdArray = payload.data; // Extract course IDs from the payload

//             // Fetch the course information based on the course IDs
//             const cousreCartInfo = await cousreService.courseCartInfo(cousreIdArray);

//             // Construct the success response
//             const response = {
//                 success: true, // Indicates the operation was successful
//                 status: 200, // HTTP status code for success
//                 message: "Course cart information retrieved successfully", // Success message
//                 data: cousreCartInfo // The actual data (course info)
//             };

//             console.log("Course Cart Info:", cousreCartInfo);

//             // Return the success response
//             return response;

//         } catch (error) {
//             // Handle known errors (e.g., validation or business logic errors)
//             if (error instanceof BadRequestError) {
//                 console.error("Bad Request Error:", error.message);
//                 throw error;  // Rethrow the BadRequestError to notify the caller
//             }

//             // Handle unexpected errors (e.g., database or network issues)
//             console.error("Unexpected error while processing the event", error);
//             throw new InternalServerError("An unexpected error occurred while processing the event", error.message);
//         }
//     },
//     "user.owns.course": async (payload) => {
//         try {
//             console.log("Handling cousreInfo.cart event...");

//             // Check if payload is provided and valid
//             if (!payload || !payload.data) {
//                 throw new BadRequestError("Invalid payload: Missing course data");
//             }

//             const ownedCourses = payload.data; // Extract course IDs from the payload

//             // Fetch the course information based on the course IDs
//             const userCourses = await cousreService.getUserOwnedCourses(ownedCourses);


//             // Construct the success response
//             const response = {
//                 success: true, // Indicates the operation was successful
//                 status: 200, // HTTP status code for success
//                 message: "Course cart information retrieved successfully", // Success message
//                 data: userCourses // The actual data (course info)
//             };

//             // Return the success response
//             return response;

//         } catch (error) {
//             // Handle known errors (e.g., validation or business logic errors)
//             if (error instanceof BadRequestError) {
//                 console.error("Bad Request Error:", error.message);
//                 throw error;  // Rethrow the BadRequestError to notify the caller
//             }

//             // Handle unexpected errors (e.g., database or network issues)
//             console.error("Unexpected error while processing the event", error);
//             throw new InternalServerError("An unexpected error occurred while processing the event", error.message);
//         }
//     }

//     // Add more event handlers as needed
// };









// /**
//  * Resolves the appropriate handler for a given event type.
//  * @param {string} eventType - The event type (e.g., "user.created").
//  * @param {object} payload - The event payload.
//  */
// export const handleEvent = async (eventType, payload) => {
//     if (eventHandlers[eventType]) {
//         return await eventHandlers[eventType](payload);
//     } else {
//         console.warn(`No handler found for event: ${eventType}`);
//         return {
//             success: false,
//             message: "Event handler not found",
//             statusCode: 404
//         };
//     }
// };
