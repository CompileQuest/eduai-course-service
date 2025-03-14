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
    static error(error) {
        return {
            success: false,
            statusCode: error.statusCode || STATUS_CODES.INTERNAL_ERROR,
            message: error.message || 'An unexpected error occurred.',
            data: error.data || null,  // Include any additional error details if necessary
        };
    }
}

export default ResponseHelper;