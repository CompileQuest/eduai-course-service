import { APIError, STATUS_CODES, AppError } from './app-errors.js';
class ResponseHelper {
    // Success response structure
    static success(message, data = null) {
        return {
            success: true,
            statusCode: 200,
            message: message,
            data: data,
        };
    }

    // Error response structure
    static error(message, statusCode) {
        return {
            success: false,
            statusCode: statusCode || STATUS_CODES.INTERNAL_ERROR,
            message: message || 'An unexpected error occurred.',
            data: null,  // Include any additional error details if necessary
        };
    }
}

export default ResponseHelper;