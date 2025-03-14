import depd from 'prisma';
import ChatBotRepository from '../database/repository/chatbot-repository.js';
import { APIError, InternalServerError, ForbiddenError, AppError, NotFoundError } from '../utils/app-errors.js';
import { uploadImage } from './cloudinary/image-uploader.js';
import { deleteImageFromCloudinary } from './cloudinary/cloudinary-utils.js';
import ResponseHelper from '../utils/responseHelper.js';

class ChatBotService {
    constructor() {
        this.repository = new ChatBotRepository();
    }

    async getFileBySectionId(courseId, sectionid) {
        try {
            // 1. Verify if the sections belong to the course
            //const doesCourseExist = await this.repository.checkIfCourseExists(courseId);

            // if (!doesCourseExist) {
            //     throw new NotFoundError("No course for this id .");
            // }



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
                console.log(error);
                throw new InternalServerError("An unexpected error occurred while geting the file for this section.");
            }
        }
    }
    async getFilesForCourse(courseId, sectionid) {
        try {
            // 1. Verify if the sections belong to the course
            //const doesCourseExist = await this.repository.checkIfCourseExists(courseId);

            // if (!doesCourseExist) {
            //     throw new NotFoundError("No course for this id .");
            // }



            const files = await this.repository.getFilesForCourse(courseId);
            if (!files) {
                throw new InternalServerError("Error fetching files for this course ");
            }
            return ResponseHelper.success('Fetched file  Successfully', files);

        } catch (error) {
            // Handling specific errors for the service layer
            if (error instanceof NotFoundError) {
                throw error;  // Rethrow the error for proper handling
            } else {
                // For unknown errors, you can throw a general internal error
                console.log(error);
                throw new InternalServerError("An unexpected error occurred while geting the files for this course.");
            }
        }
    }


}

export default ChatBotService;
