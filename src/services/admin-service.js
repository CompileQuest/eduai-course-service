import AdminRepository from '../database/repository/admin-repository.js';
import { APIError, InternalServerError, ForbiddenError, AppError, NotFoundError } from '../utils/app-errors.js';
import { uploadImage } from './cloudinary/image-uploader.js';
import { deleteImageFromCloudinary } from './cloudinary/cloudinary-utils.js';
import ResponseHelper from '../utils/responseHelper.js';
import rabbitMQClient from '../infrastructure/messageQueue/fireAndForget/RabbitMQClient.js';
import { RoutingKeys } from '../infrastructure/messageQueue/fireAndForget/settings/routingKeys.js';


class AdminService {
    constructor() {
        this.repository = new AdminRepository();
    }


    async getPaginatedCourses(page, limit, status) {
        try {


            console.log(status);
            const { courses, total } = await this.repository.getPaginatedCourses(page, limit, status);

            if (!courses.length) {
                throw new NotFoundError("No courses found");
            }

            return ResponseHelper.success('Fetched courses successfully', { courses, total });

        } catch (error) {
            console.error("Error fetching  lolol crses:", error);
            throw new InternalServerError("An unexpected error occurred while getting courses.");
        }
    }


    async publishCourse(courseId) {
        try {
            // Validate input
            if (!courseId) {
                throw new BadRequestError("Course ID is required", "Missing courseId parameter");
            }

            // Update the course status to PUBLISHED
            const publishedCourse = await this.repository.publishCourse(courseId);
            console.log("Changed Status to PUBLISHED!!", publishedCourse);

            // If course wasn't found or update failed
            if (!publishedCourse) {
                throw new NotFoundError(
                    "Course not found",
                    `No course with ID ${courseId} was updated`
                );
            }

            // Notify other services (e.g., notification, indexing)
            await rabbitMQClient.produce(RoutingKeys.COURSE_CREATED, publishedCourse);

            return publishedCourse;

        } catch (error) {
            // Known operational errors (user-triggered)
            if (error instanceof AppError) {
                throw error;
            }

            // Log unexpected internal errors (optional logging service can be added here)
            console.error("Unexpected error in publishCourse:", error);

            // Throw API error with original message preserved
            throw new APIError(
                "Something went wrong while publishing the course",
                error.message
            );
        }
    }

    async getCoursesFiltered({
        searchByTitle, title,
        page = 1, limit = 10
    }) {
        try {
            const { courses, total } = await this.repository.getCoursesFiltered({
                searchByTitle, title,
                page, limit
            });

            // Instead of throwing an error, return a response with an empty list
            if (!courses.length) {
                return ResponseHelper.success('No courses found matching the given criteria.', { courses: [], total: 0 });
            }

            return ResponseHelper.success('Fetched filtered courses successfully', { courses, total });
        } catch (error) {
            console.error("Error fetching filtered courses:", error);
            throw new InternalServerError("An unexpected error occurred while getting filtered courses.");
        }
    }

}



export default AdminService;
