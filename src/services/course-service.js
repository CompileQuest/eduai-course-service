import CourseRepository from '../database/repository/course-repository.js';
import { APIError, InternalServerError, ForbiddenError, AppError, NotFoundError } from '../utils/app-errors.js';
import { uploadImage } from './cloudinary/image-uploader.js';
import { deleteImageFromCloudinary } from './cloudinary/cloudinary-utils.js';
import ResponseHelper from '../utils/responseHelper.js';
import ROLES from '../config/roles.js';
import HttpClient from './external/httpClient.js';
import services from './external/services.js';
import EVENTS from './external/events.js';
import { FormateData } from '../utils/index.js';
class CourseService {
    constructor() {
        this.repository = new CourseRepository();
        this.httpClient = new HttpClient();
    }


    async FetchCourseTemplateById(courseId) {
        return await this.repository.FetchCourseTemplateById(courseId);
    }



    async publishCourse(cousreId) {
        try {

            const courses = await this.repository.publishCourse(cousreId);
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





    async getUserOwnedCourses(userId, ownedCourses) {
        try {
            const userCourses = await this.repository.getUserOwnedCourses(userId, ownedCourses);
            console.log("this is the user courses ", userCourses);

            return userCourses;
        } catch (error) {
            console.log("this si the error ", error.message)
            throw new APIError("something went wrong while fetching user courses");
        }
    }




    async getUserBookmarkCourse(courseId) {
        try {


            console.log("this isthe course id before doing the databse operation ", courseId);
            const userBookmarkCourse = await this.repository.getUserBookmarkCourse(courseId);
            console.log("this is the user courses ", userBookmarkCourse);


            if (!userBookmarkCourse) {
                throw new NotFoundError("No bookmark courses found for this user");
            }

            return userBookmarkCourse;
        } catch (error) {
            console.log("this si the error ", error.message)
            throw new APIError("something went wrong while fetching user courses");
        }
    }


    async getLandingPageCourses(filter) {
        try {

            const courses = await this.repository.getLandingPageCourses(filter);
            console.log("Courses Fetched Successfully");

            console.log("this is the cousre ", courses)

            // Return a success response using ResponseHelper
            return ResponseHelper.success('Courses Fetched Successfuly', courses);
        } catch (error) {
            console.error("Error updating thumbnail:", error);

            // Handle specific errors (e.g., image upload or DB update failures)
            if (error instanceof APIError) {
                return ResponseHelper.error('Specific error message', 400);
            }

            // General error handling
            return ResponseHelper.error('Failed to fetch courses', 500);
        }
    }



    async checkIfQuizFileExist(courseId, sectionId) {
        try {
            const quizFiles = await this.repository.checkIfQuizFileExist(courseId, sectionId);
            console.log("this si the quiz file ", quizFiles);
            if (!quizFiles || quizFiles.length === 0) {
                console.log("in here !!!")
                return false;
            }

            return true;
        } catch (error) {
            throw new APIError("something went wrong checking the quiz file exist or not !!");
        }
    }



    async handlePaymentCompleted(userId, courseId) {
        try {
            const result = await this.repository.handlePaymentCompleted(userId, courseId);


            return {
                success: true,
                message: "Payment processed successfully",
                data: true
            }
        } catch (error) {
            console.log("this is the error  ", error.message)
            throw new APIError("something went wrong while updating the payment");
        }
    }


    async getFilterCoursesPaginated(
        page,
        limit,
        categoriesArray,
        levelsArray,
        rating,
        sortByPolicy
    ) {
        try {
            // Validate inputs
            if (page < 1) throw new Error('Page must be at least 1');
            if (limit < 1) throw new Error('Limit must be at least 1');

            // Normalize sort policy
            const validSortPolicies = ['Newest', 'Oldest'];
            const normalizedSortPolicy = validSortPolicies.includes(sortByPolicy)
                ? sortByPolicy
                : 'Newest';

            // Get data from repository
            const result = await this.repository.getFilterCoursesPaginated(
                page,
                limit,
                categoriesArray,
                levelsArray,
                rating,
                normalizedSortPolicy
            );

            if (result.data.length === 0) {
                return ResponseHelper.success("No courses found matching the criteria", {
                    courses: [],
                    pagination: result.pagination
                });
            }

            // Transform data if needed (e.g., map to DTOs)
            const transformedCourses = result.data.map(course => ({
                ...course,
                // Add any transformations here
            }));

            return ResponseHelper.success("Courses fetched successfully", {
                courses: transformedCourses,
                pagination: result.pagination
            });
        } catch (error) {
            console.error("Error fetching filtered courses:", error);
            return ResponseHelper.error('Failed to fetch filtered courses', 500);
        }
    }



    async FetchCourseProductionById(courseId, userId, currentRole) {
        try {
            let course;
            let ownsCourse = false;
            if (userId && currentRole === ROLES.STUDENT) {
                // Step 1: Check if the user owns/enrolled in the course via the User Service
                // TODO: Actually call the User Service to set this value
                let payload = {
                    userId: userId,
                    courseId: courseId
                }
                payload = FormateData(payload);


                // Todo instead of talking to the user service i can know if 
                // todo the user have access from the progress table when course purhcases happens !!
                console.log("this is the payload ", payload);
                const result = await this.httpClient.callService(
                    services.userService, // Service name
                    EVENTS.USER_OWNS_COURSE, // Event or endpoint
                    payload // Pass the HttpMessage as the payload
                );

                ownsCourse = result;
                if (ownsCourse) {
                    console.log("1");
                    // Step 2a: Fetch full course access if user owns the course
                    course = await this.repository.FetchCourseWithUserAccess(courseId);

                    // convert all videos to free for this user !!
                    course.sections?.forEach(section => {
                        section.videos?.forEach(video => {
                            video.is_free = true;
                        });
                        section.files?.forEach(file => {
                            file.is_free = true;
                        });
                    });
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
                designation: "Front-end Developer, Designer",
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

    // Fetch course categories
    async fetchCourseCategories(courseId) {
        const course = await this.repository.fetchCourseCategories(courseId);

        if (!course || !course.categories) {
            throw new Error('Course or categories not found');
        }

        return course.categories.map(cat => cat.category.id);
    }


    async fetchRelatedCourses(courseId) {
        try {
            // Fetch course categories first
            const categoryIds = await this.repository.fetchCourseCategoryIds(courseId);
            console.log("this is the category id ", categoryIds);

            // Fetch related courses based on these categories
            const relatedCourses = await this.repository.fetchRelatedCoursesByCategory(categoryIds, courseId);

            // If no related courses found, return an error response
            if (!relatedCourses || relatedCourses.length === 0) {
                return ResponseHelper.error('Related courses not found', 404);
            }


            // Transform the data to include calculated fields
            const transformedCourses = relatedCourses.map(course => {
                // Calculate total course hours from video durations (in seconds)
                const totalSeconds = course.sections.reduce((sum, section) => {
                    return sum + section.videos.reduce((sectionSum, video) => {
                        return sectionSum + (video.duration || 0);
                    }, 0);
                }, 0);

                const totalHours = (totalSeconds / 3600).toFixed(1); // Convert to hours

                return {
                    id: course.id,
                    title: course.title,
                    thumbnailUrl: course.thumbnailUrl,
                    totalHours,
                    difficultyLevel: course.difficultyLevel,
                    averageRating: course.averageRating,
                    categoryId: course.categories[0]?.category.id,
                    categoryName: course.categories[0]?.category.name,
                    totalReviews: course.totalReviews,
                    instructorId: course.instructorId,
                    instructorName: "Mohamed Ali", // Temporary - replace with actual instructor data
                    instructorPicture: "temp-url-here" // Temporary - replace with actual instructor data
                };
            });

            // Return success response with the transformed courses
            return ResponseHelper.success('Related courses fetched successfully', transformedCourses);
        } catch (error) {
            console.error("Error fetching related courses:", error);
            return ResponseHelper.error('Failed to fetch related courses', 500);
        }
    }



    async updateCourse(instructorId, courseId, data) {
        try {
            // Input validation
            if (!data) {
                throw new APIError('Course data is required', 400);
            }

            // Fetch existing course (repository call)
            const existingCourse = await this.repository.findCourseById(courseId);
            if (!existingCourse) {
                throw new APIError('Course not found', 404);
            }

            // Authorization check
            if (existingCourse.instructorId !== instructorId) {
                throw new APIError('Unauthorized to edit this course', 403);
            }

            // Data transformation
            const updateData = {
                title: data.title,
                shortDescription: data.shortDescription,
                description: data.description,
                whatYouWillLearn: data.whatYouWillLearn,
                requirements: data.requirements,
                category: data.category,
                level: data.level,
                price: parseFloat(data.price),
            };

            // Core update (repository call)
            const updatedCourse = await this.repository.updateCourse(courseId, updateData);
            console.log("Updated course data:", updatedCourse);
            if (!updatedCourse) {
                throw new APIError('Failed to update course');
            }

            return updatedCourse;

        } catch (error) {
            // Special handling for Prisma errors


            // Re-throw our custom errors
            if (error instanceof APIError) {
                throw error;
            }

            // Log and wrap unexpected errors
            console.error('Course update failed:', error);
            throw new APIError('Failed to update course', 500, error.message);
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


    async getCousreCartInfo(courseIdArray) {
        try {
            // Call the repository function to fetch course details
            const courseInfo = await this.repository.getCousreCartInfo(courseIdArray);
            console.log("this is the course info ", courseInfo);

            // Return the course info
            return courseInfo;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;  // If the error is an instance of AppError, rethrow it
            }

            throw new InternalServerError("An error occurred while fetching course info", error.message);
        }
    }


    async DeleteCourseById(courseId) {
        return await this.repository.DeleteCourseTemplate(courseId);
    }


    async FetchCategories() {
        return await this.repository.FetchCategories();
    }

    async createCourseTemplate(data, image, instructorId) {
        try {
            if (!data) {
                throw new APIError('Course data is required', 400);
            }



            // Transform the data to match schema
            const courseTemplateData = {
                title: data.title,
                instructorId: instructorId,
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

            if (!courseTemplate) {
                throw new APIError('Failed to create course template', 400);
            }


            // 
            if (!image) {
                throw new APIError('Course Created But problem with thumbnail image not uploaded!!', 400);
            }

            try {
                // Upload image to cloudinary
                const imageUrl = await uploadImage(
                    image.buffer,
                    `courses/${courseTemplate.id}/thumbnail`,
                    `${courseTemplate.id}-thumbnail-image`
                );


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
                    error.message
                );
            }
        } catch (error) {
            throw new APIError(
                'Failed to create course template',
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

    async FetchCourseContentForInstructor(instructorId, courseId) {
        try {

            // 1. Check if the instructor owns the course
            await this._validateInstructorOwnership(courseId, instructorId);


            const course = await this.repository.FetchCourseContentForInstructor(courseId);
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



    async editVideo(courseId, instructorId, videoId, title, isFree) {
        try {
            // Use the reusable validation method
            await this._validateInstructorOwnership(courseId, instructorId);


            // Edit section
            const editedVideo = await this.repository.editVideo(videoId, title, isFree);
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


            return ResponseHelper.success("Video is saved successfully!");

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




    async getSectionFiles(courseId, instructorId) {
        try {
            // Use the reusable validation method
            await this._validateInstructorOwnership(courseId, instructorId);

            // Fetch section files
            const sectionFiles = await this.repository.getSectionFiles(courseId);

            if (!sectionFiles) {
                throw new NotFoundError(`No files found for course with ID ${courseId}`);
            }


            // Transform the data here !!!
            return sectionFiles;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.error("Unexpected error in fetching section files:", error);
                throw new InternalServerError("An error occurred while fetching section files");
            }
        }
    }



}


export default CourseService;
