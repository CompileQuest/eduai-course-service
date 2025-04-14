import CourseRepository from '../database/repository/course-repository.js';
import { APIError, InternalServerError, ForbiddenError, AppError, NotFoundError } from '../utils/app-errors.js';
import { uploadImage } from './cloudinary/image-uploader.js';
import { deleteImageFromCloudinary } from './cloudinary/cloudinary-utils.js';
import ResponseHelper from '../utils/responseHelper.js';
import ROLES from '../config/roles.js';

class CourseService {
    constructor() {
        this.repository = new CourseRepository();
    }


    async FetchCourseTemplateById(courseId) {
        return await this.repository.FetchCourseTemplateById(courseId);
    }



    async getLandingPageCourses(filter) {
        try {

            const courses = await this.repository.getLandingPageCourses(filter);
            console.log("Courses Fetched Successfully");

            // Return a success response using ResponseHelper
            return ResponseHelper.success('Courses Fetched Successfuly', courses);
        } catch (error) {
            console.error("Error updating thumbnail:", error);

            // Handle specific errors (e.g., image upload or DB update failures)
            if (error instanceof SomeSpecificError) {
                return ResponseHelper.error('Specific error message', 400);
            }

            // General error handling
            return ResponseHelper.error('Failed to fetch courses', 500);
        }
    }


    async FetchCourseProductionById(courseId, userId, currentRole) {
        try {
            let course;
            let ownsCourse = false;

            if (userId && currentRole === ROLES.STUDENT) {
                // Step 1: Check if the user owns/enrolled in the course via the User Service
                // TODO: Actually call the User Service to set this value
                // ownsCourse = await userService.checkEnrollment(courseId, userId);

                if (ownsCourse) {
                    console.log("1");
                    // Step 2a: Fetch full course access if user owns the course
                    course = await this.repository.FetchCourseWithUserAccess(courseId);
                } else {
                    console.log("2");
                    // Step 2b: Fetch locked/public version if user does not own the course
                    course = await this.repository.FetchCourseProductionById(courseId);
                }
            } else {
                console.log("3");
                // Step 3: Fetch public version for unauthenticated users
                course = await this.repository.FetchCourseProductionById(courseId);
            }

            if (!course) {
                return ResponseHelper.error('Course not found', 404);
            }

            // ✅ Add ownership info to the course object
            course.ownsCourse = ownsCourse;

            // Instructor data
            const instructorData = {
                name: "Jenny Wilson",
                role: "Front-end Developer, Designer",
                rating: 4.5,
                students: 11604,
                courses: 32,
                reviews: 12230,
                verified: true,
                bio: "I am an Innovation designer focusing on UX/UI based in Berlin. As a creative resident at Figma, I explored the city of the future and how new technologies."
            };

            // Add instructor data to the course object
            course.instructorData = instructorData;

            return ResponseHelper.success('Course fetched successfully', course);
        } catch (error) {
            console.error("Error fetching course:", error);
            return ResponseHelper.error('Failed to fetch course', 500);
        }
    }








    async updateThumbNail(courseId, image) {
        try {
            // 1. Fetch the course to get the existing thumbnail information (to delete)
            const courseThumbNail = await this.repository.FetchCourseThumbnail(courseId);

            // Check if the course exists and has a thumbnail to delete
            if (courseThumbNail?.thumbnailPublicId) {
                // 2. Delete the old thumbnail from Cloudinary
                await deleteImageFromCloudinary(courseThumbNail.thumbnailPublicId);
            }

            // 3. Upload the new image to Cloudinary
            const imageUrl = await uploadImage(image.buffer, `courses/${courseId}/thumbnail`);

            // Create image data with the new URL and public ID
            const imageData = {
                url: imageUrl.url,
                publicId: imageUrl.public_id
            };

            console.log("Updated image data:", imageData);

            // 4. Update the course record in the database with the new image data
            const updatedTemplate = await this.repository.UpdateCourseTemplate(
                courseId,
                imageData // Pass new image data
            );

            console.log("Course updated successfully with new thumbnail");

            // Return a success response using ResponseHelper
            return ResponseHelper.success('Course thumbnail updated successfully', updatedTemplate);
        } catch (error) {
            console.error("Error updating thumbnail:", error);

            // Handle specific errors (e.g., image upload or DB update failures)
            if (error instanceof SomeSpecificError) {
                return ResponseHelper.error('Specific error message', 400);
            }

            // General error handling
            return ResponseHelper.error('Failed to update course thumbnail', 500);
        }
    }

    async DeleteCourseById(courseId) {
        return await this.repository.DeleteCourseTemplate(courseId);
    }

    async UpdateCourse(courseId, updates) {
        return await this.repository.UpdateCourseById(courseId, updates);
    }

    async FetchCategories() {
        return await this.repository.FetchCategories();
    }

    async createCourseTemplate(data, image) {
        try {
            if (!data) {
                throw new APIError('Course data is required', 400);
            }

            if (!image) {
                throw new APIError('Course thumbnail image is required', 400);
            }

            // Transform the data to match schema
            const courseTemplateData = {
                title: data.title,
                short_description: data.shortDescription,
                description: data.description,
                what_you_will_learn: data.whatYouWillLearn,
                requirements: data.requirements,
                category_id: data.category,
                level: data.level,
                price: parseFloat(data.price),
                sections: JSON.parse(data.sections),
            };

            // Create course template
            const courseTemplate = await this.repository.CreateCourseTemplate(courseTemplateData);

            try {
                // Upload image to cloudinary
                const imageUrl = await uploadImage(image.buffer, `courses/${courseTemplate.id}/thumbnail`);

                const imageData = {
                    url: imageUrl.url,
                    publicId: imageUrl.public_id
                };

                console.log("imageData", imageData);

                // Update template with thumbnail URL
                const updatedTemplate = await this.repository.UpdateCourseTemplate(
                    courseTemplate.id,
                    imageData // Pass imageData directly
                );

                return updatedTemplate;
            } catch (error) {
                // If image upload fails, delete the created template
                await this.repository.DeleteCourseTemplate(courseTemplate.id);
                throw new APIError(
                    'Failed to upload course thumbnail',
                    error.statusCode || 500,
                    error.message
                );
            }
        } catch (error) {
            throw new APIError(
                'Failed to create course template',
                error.statusCode || 500,
                error.message
            );
        }
    }



    async FetchCoursesPaginated(instructorId, page, limit) {
        try {

            const InstructorCourses = await this.repository.FetchInstructorCoursesPaginated(instructorId, page, limit);

            if (InstructorCourses.length === 0) {
                return ResponseHelper.success("You don't have yet any courses !! Create one ");
            }


            return ResponseHelper.success("Fetch your courses successfuly ", InstructorCourses);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.error("Unexpected error while fetching instructor courses", error);
                throw new InternalServerError("An error occurred while fetchign instructor courses !!", error.message);
            }
        }
    }

    async getSectionTemp(courseId) {
        try {
            const sections = await this.repository.getSectionTemp(courseId);

            if (sections.length === 0) {
                return ResponseHelper.success("No sections found", []);
            }

            const sectionsWithQuizzes = sections.map((section, index) => ({
                ...section,
                quiz: index % 2 === 0 ? { // Assign quiz data to some sections, leave others null
                    difficulty: 'medium',
                    courseid: courseId,
                    sectionid: section.id,
                    quizTime: 8, // in minutes
                    passingScore: 80, // percentage
                    numberOfQuestions: 15,
                    typeOfQuestion: {
                        mcq: true,
                        trueOrFalse: false,
                        criticalThinking: true,
                        generalKnowledge: false,
                        problemSolving: true,
                        practicalSkills: false,
                    }
                } : null
            }));

            return ResponseHelper.success("Fetch your sections successfully", sectionsWithQuizzes);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.error("Unexpected error while fetching sections", error);
                throw new InternalServerError("An error occurred while fetching sections!!");
            }
        }
    }


    async FetchCourseTemplate() {
        return await this.repository.FetchCourseTemplate();
    }

    async FetchCourseContentById(courseId) {
        try {
            const course = await this.repository.FetchCourseContentById(courseId);
            //console.log(course);
            console.dir(course, { depth: null, colors: true });

            if (!course) {
                throw new NotFoundError(`no resource found for courseid ${courseId}`);
            }
            return course;
        } catch (error) {
            // ✅ Check for any custom AppError (APIError, BadRequestError, etc.)
            if (error instanceof AppError) {
                throw error; // Re-throw known errors
            } else {
                // Wrap unknown errors in a standard APIError
                throw new APIError(
                    `Unable to fetch course content for courseId: ${courseId}. Original error: ${error.message}`
                );
            }
        }
    }


    async UpdateSectionsSorting(courseId, sections) {
        return await this.repository.UpdateSectionsSorting(courseId, sections);
    }


    async UpdateVideoSorting(courseId, sections) {
        try {
            // 1. Verify if the sections belong to the course
            const validSections = await this.repository.getSectionsByCourse(courseId);
            console.log("this is the validSection ", validSections);
            const sectionIds = validSections.map(section => section.id);
            console.dir(sections, { depth: null, colors: true });

            // Filter sections that belong to the course
            const validSectionsForCourse = sections.filter(section => sectionIds.includes(section.id));
            console.log("this is the valid section", validSectionsForCourse);

            if (validSectionsForCourse.length === 0) {
                throw new NotFoundError("No valid sections found for this course.");
            }

            // 2. Iterate through each section and update video orders
            for (let section of validSectionsForCourse) {
                // 3. Update the video order using the repository layer
                for (let video of section.videos) {
                    const videoId = video.id;
                    const newOrder = video.order;

                    // Call the repository function to update the video order
                    await this.repository.updateVideoOrder(videoId, newOrder);
                }
            }
            console.log("i am here ");
            // You can also return some success message or status if needed
            return ResponseHelper.success('Video Updated Successfully');
            //return { message: 'Video sorting updated successfully' };

        } catch (error) {
            // Handling specific errors for the service layer
            if (error instanceof NotFoundError) {
                throw error;  // Rethrow the error for proper handling
            } else {
                // For unknown errors, you can throw a general internal error
                console.log(error);
                throw new InternalServerError("An unexpected error occurred while updating the video sorting.");
            }
        }
    }



    async addSection(courseId, title) {
        try {
            // Get max order from sections of the course
            const maxOrder = await this.repository.getMaxOrderOfSectionsByCourseId(courseId);

            // Add new section with order incremented by 1
            const newOrder = maxOrder + 1;
            const newSection = await this.repository.addSection(courseId, title, newOrder);

            return ResponseHelper.success('Section added successfully', newSection);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw new NotFoundError("Course not found");
            } else {
                console.log(error)
                throw new InternalServerError("An unexpected error occurred while adding the section.");
            }
        }
    }


    async deleteSectionById(courseId, sectionId, instructorId) {
        try {
            // Check if the instructor owns the course
            const isOwner = await this.repository.checkOwnershipOfCourse(courseId, instructorId);
            if (!isOwner) {
                throw new ForbiddenError("You are not authorized to delete this section.");
            }

            // Mark the section as deleted
            const sectionDeleted = await this.repository.markSectionAsDelete(sectionId);
            if (!sectionDeleted) {
                throw new InternalServerError("Failed to delete section.");
            }

            // Fetch all video IDs for the section
            const videoIds = await this.repository.getSectionVideosIds(sectionId);
            if (!videoIds || videoIds.length === 0) {
                console.warn(`No videos found for section ${sectionId}.`);
            }

            // Mark all videos as deleted
            for (const videoId of videoIds) {
                const videoDeleted = await this.repository.markVideoDelete(videoId);
                if (!videoDeleted) {
                    console.warn(`Warning: Failed to delete video ${videoId}`);
                }
            }

            // TODO: Mark quizzes as deleted (future implementation)
            // TODO: Mark section progress as deleted (future implementation)

            return ResponseHelper.success("Section and its content are deleted successfully !!");
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.error("Unexpected error in deleteSectionById:", error);
                throw new InternalServerError("An error occurred while deleting the section.");
            }
        }
    }


    // Reusable method to check if instructor owns the course
    async _validateInstructorOwnership(courseId, instructorId) {
        const isOwner = await this.repository.checkOwnershipOfCourse(courseId, instructorId);
        if (!isOwner) {
            throw new ForbiddenError("You are not authorized to modify this section.");
        }
    }


    async editSection(courseId, sectionId, instructorId, title) {
        try {
            // Use the reusable validation method
            await this._validateInstructorOwnership(courseId, instructorId);

            // Edit section
            const editedSection = await this.repository.editSection(sectionId, title);
            if (!editedSection) {
                throw new InternalServerError("Failed to edit section.");
            }

            return ResponseHelper.success("Section title updated successfully!");
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.error("Unexpected error in editing Section title:", error);
                throw new InternalServerError("An error occurred while editing the section.");
            }
        }
    }


    async deleteVideo(courseId, instructorId, videoId) {
        try {
            // Use the reusable validation method
            await this._validateInstructorOwnership(courseId, instructorId);

            // Edit section
            const deletedVideo = await this.repository.markVideoDelete(videoId);
            if (!deletedVideo) {
                throw new InternalServerError("Failed to Delete Video.");
            }

            return ResponseHelper.success("Video is deleted successfully!");
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.error("Unexpected error in editing Section title:", error);
                throw new InternalServerError("An error occurred while Deleting Video");
            }
        }
    }



    async editVideo(courseId, instructorId, videoId, payload) {
        try {
            // Use the reusable validation method
            await this._validateInstructorOwnership(courseId, instructorId);


            // Edit section
            const editedVideo = await this.repository.editVideo(videoId, payload);
            if (!editedVideo) {
                throw new InternalServerError("Failed to edit Video.");
            }

            return ResponseHelper.success("Video is deleted successfully!");
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.error("Unexpected error in editing Video", error);
                throw new InternalServerError("An error occurred while Editing Video");
            }
        }
    }





    async getCoursePreview(courseId) {
        try {
            // Get max order from sections of the course
            const coursePreview = await this.repository.getCoursePreview(courseId);

            if (!coursePreview) {
                throw new NotFoundError(`No Course Preview For Cousre With Id ${courseId}`);
            }


            return ResponseHelper.success('Fetched the Cousre Preview', coursePreview);
        } catch (error) {
            if (error instanceof AppError) {
                throw error
            } else {
                console.log(error)
                throw new InternalServerError("An unexpected error occurred while adding the section.");
            }
        }
    }



    async SaveVideoToSection(payload) {
        try {
            // Use the reusable validation method
            const savedVideo = await this.repository.SaveVideoToSection(payload);


            if (!savedVideo) {
                throw new InternalServerError("Failed to save Video.");
            }

            console.log("video is saved !!!!")
            return ResponseHelper.success("Video is deleted successfully!");
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.error("Unexpected error in saving a video", error);
                throw new InternalServerError("An error occurred while saving Video");
            }
        }
    }




    async SaveFileToSection(payload) {
        try {
            // Use the reusable validation method
            const savedFile = await this.repository.SaveFileToSection(payload);


            if (!savedFile) {
                throw new InternalServerError("Failed to save File.");
            }

            console.log("saved file successfully")

            return ResponseHelper.success("File is saved successfully!");
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.error("Unexpected error in saving a video", error);
                throw new InternalServerError("An error occurred while saving File");
            }
        }
    }


}


export default CourseService;
