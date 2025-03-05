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


    async getFileBySectionId(courseId, sectionid) {
        try {

            console.log(courseId);
            console.log(sectionid);

            const file = await this.repository.getFileBySectionId(courseId, sectionid);
            if (!file) {
                throw new InternalServerError("Error fetching file for this section ");
            }
            return ResponseHelper.success('Fetched file  Successfully', file);

        } catch (error) {
            // Handling specific errors for the service layer
            if (error instanceof NotFoundError) {
                throw error;  // Rethrow the error for proper handling
            } else {
                // For unknown errors, you can throw a general internal error
                console.log("lololo ", error);
                throw new InternalServerError("An unexpected error occurred while geting the file for this section.");
            }
        }
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
                throw new InternalServerError("An unexpected error occurred while geting the course.");
            }
        }
    }



}


module.exports = QuizService;
