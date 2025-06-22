import AdminRepository from '../database/repository/admin-repository.js';
import { APIError, InternalServerError, ForbiddenError, AppError, NotFoundError } from '../utils/app-errors.js';
import { uploadImage } from './cloudinary/image-uploader.js';
import { deleteImageFromCloudinary } from './cloudinary/cloudinary-utils.js';
import ResponseHelper from '../utils/responseHelper.js';
import rabbitMQClient from '../infrastructure/messageQueue/fireAndForget/RabbitMQClient.js';
import { RoutingKeys } from '../infrastructure/messageQueue/fireAndForget/settings/routingKeys.js';
import HttpClient from './external/httpClient.js';
import services from './external/services.js';
import EVENTS from './external/events.js';
import { FormateData } from '../utils/index.js';
import COURSE_STATUS from '../constants/courseStatusEnum.js';

class AdminService {
    constructor() {
        this.repository = new AdminRepository();
        this.httpClient = new HttpClient();
    }


    async getPaginatedCourses(page, limit, status) {
        try {
            console.log(status);
            status = status.toUpperCase();

            // Get courses and total count
            const { courses, total } = await this.repository.getPaginatedCourses(page, limit, status);
            console.log("this is the courses ", courses);

            // Extract instructor IDs
            const instructorIds = courses.map(course => course.instructorId);
            console.log("this is the instructor ids ", instructorIds);

            // Prepare payload and call user service to get instructor info
            const payload = FormateData({ instructorIds });
            const instructors = await this.httpClient.callService(services.userService, EVENTS.INSTRUCTOR_INFO_COURSE_TABLE, payload);
            console.log("this is the response from the user service ", instructors);

            // Create a lookup map from instructor id to instructor info
            const instructorMap = {};
            instructors.forEach(inst => {
                instructorMap[inst.id] = inst;
            });

            // Merge instructor info into each course
            const coursesWithInstructor = courses.map(course => {
                const { instructorId, ...courseWithoutInstructorId } = course;  // extract and omit instructorId
                return {
                    ...courseWithoutInstructorId,
                    instructor: instructorMap[instructorId] || null
                };
            });


            return {
                success: true,
                message: "Fetched courses successfully",
                data: {
                    courses: coursesWithInstructor,
                    total
                }
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error("Error fetching courses:", error);
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



    // service/adminService.js

    async updateCourseStatus(courseId, status) {
        try {

            const updatedCourse = await this.repository.updateCourseStatus(courseId, status);
            if (!updatedCourse) {
                throw new NotFoundError(
                    "Course not found",
                    `No course with ID ${courseId} was updated`
                );
            }

            // 🔁 Trigger different actions based on the status
            switch (status) {
                case COURSE_STATUS.PUBLISHED:
                    console.log("Changed Status to PUBLISHED!!", updatedCourse);
                    //await rabbitMQClient.produce(RoutingKeys.COURSE_CREATED, updatedCourse);
                    break;

                case COURSE_STATUS.REJECTED:
                    console.log("Course Rejected: Notify user");
                    await rabbitMQClient.produce(RoutingKeys.COURSE_REJECTED, updatedCourse);
                    break;

                case COURSE_STATUS.ARCHIVED:
                    console.log("Course Archived");
                    // Maybe log or audit
                    break;

                case COURSE_STATUS.UNPUBLISHED:
                    console.log("Course Unpublished");
                    await rabbitMQClient.produce(RoutingKeys.COURSE_UNPUBLISHED, updatedCourse);
                    break;

                // Add cases as needed for other statuses
                case COURSE_STATUS.APPROVED:
                case COURSE_STATUS.DRAFT:
                case COURSE_STATUS.PENDING:
                case COURSE_STATUS.SUSPENDED:
                case COURSE_STATUS.UNDER_REVIEW:
                case COURSE_STATUS.EXPIRED:
                    console.log(`Course status changed to ${status}`);
                    break;

                default:
                    console.warn(`No logic defined for course status: ${status}`);
                    break;
            }

            return updatedCourse;

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("Unexpected error in updateCourseStatus:", error);

            throw new APIError(
                `Something went wrong while updating the course to ${status}`,
                error.message
            );
        }
    }


}



export default AdminService;
