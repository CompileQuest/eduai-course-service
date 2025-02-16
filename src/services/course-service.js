const CourseRepository = require('../database/repository/course-repository');
const { APIError, UnauthorizedError, STATUS_CODES, BadRequestError , AppError , NotFoundError} = require('../utils/app-error')
const { uploadImage } = require('./cloudinary/image-uploader');

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
}


module.exports = CourseService;
