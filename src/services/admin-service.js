const AdminRepository = require('../database/repository/admin-repository');
const { APIError, InternalServerError, ForbiddenError, AppError, NotFoundError } = require('../utils/app-error')
const { uploadImage } = require('./cloudinary/image-uploader');
const { deleteImageFromCloudinary } = require('./cloudinary/cloudinary-utils');
const ResponseHelper = require('../utils/responseHelper');
class AdminService {
    constructor() {
        this.repository = new AdminRepository();
    }

    async getPaginatedCourses(page, limit, status) {
        try {

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




}


module.exports = AdminService;
