const depd = require('prisma');
const QuizRepository = require('../database/repository/quiz-handler-repository');
const { APIError, InternalServerError, ForbiddenError, AppError, NotFoundError } = require('../utils/app-error')
const { uploadImage } = require('./cloudinary/image-uploader');
const { deleteImageFromCloudinary } = require('./cloudinary/cloudinary-utils');
const ResponseHelper = require('../utils/responseHelper');
class QuizService {
    constructor() {
        this.repository = new QuizRepository();
    }


    async getCourseById(courseId) {
        try {
            // 1. Verify if the sections belong to the course
            const doesCourseExist = await this.repository.checkIfCourseExists(courseId);

            if (!doesCourseExist) {
                throw new NotFoundError("No course for this id .");
            }



            const course = await this.repository.FetchCourseContentById(courseId);
            if (!course) {
                throw new InternalServerError("Error fetching this course ");
            }
            return ResponseHelper.success('Fetched Course  Successfully', course);

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


module.exports = QuizService;
