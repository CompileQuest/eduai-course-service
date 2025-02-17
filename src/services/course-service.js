const depd = require('prisma');
const CourseRepository = require('../database/repository/course-repository');
const { APIError, InternalServerError , AppError , NotFoundError} = require('../utils/app-error')
const { uploadImage } = require('./cloudinary/image-uploader');
const { deleteImageFromCloudinary } = require('./cloudinary/cloudinary-service');
const ResponseHelper = require('../utils/responseHelper');
class CourseService {
    constructor() {
        this.repository = new CourseRepository();
    }

    async AddCourse(courseDetails) {
        return await this.repository.AddCourse(courseDetails);
    }

    async FetchAllCourses() {
        return await this.repository.FetchAllCourses();
    }

    async FetchCourseTemplateById(courseId) {
        return await this.repository.FetchCourseTemplateById(courseId);
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



    async FetchCourseTemplate() {
        return await this.repository.FetchCourseTemplate();
    }

    async FetchCourseContentById(courseId) {
        try {
            const course = await this.repository.FetchCourseContentById(courseId);

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
}


module.exports = CourseService;
