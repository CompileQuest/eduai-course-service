const STATUS_CODES = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
};

/**
 * Base Error Class
 */
class AppError extends Error {
    constructor(
        name,
        statusCode,
        description,
        isOperational = true,
        errorStack = null,
        loggingErrorResponse = null
    ) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.statusCode = statusCode;
        this.isOperational = isOperational; // Determines if error is user-triggered
        this.errorStack = errorStack;
        this.logError = loggingErrorResponse;

        // Capture the error stack trace for debugging
        Error.captureStackTrace(this);
    }
}

/**
 * API-Specific Error
 */
class APIError extends AppError {
    constructor(
        description = "Internal Server Error",
        isOperational = true
    ) {
        super("API Error", STATUS_CODES.INTERNAL_ERROR, description, isOperational);
    }
}

/**
 * 400 - Bad Request Error
 */
class BadRequestError extends AppError {
    constructor(description = "Bad Request", loggingErrorResponse = null) {
        super(
            "Bad Request",
            STATUS_CODES.BAD_REQUEST,
            description,
            true,
            null,
            loggingErrorResponse
        );
    }
}

/**
 * 401 - Unauthorized Error
 */
class UnauthorizedError extends AppError {
    constructor(description = "Unauthorized Access") {
        super("Unauthorized", STATUS_CODES.UNAUTHORIZED, description, true);
    }
}

/**
 * 403 - Forbidden Error
 */
class ForbiddenError extends AppError {
    constructor(description = "Forbidden Access") {
        super("Forbidden", STATUS_CODES.FORBIDDEN, description, true);
    }
}

/**
 * 404 - Not Found Error
 */
class NotFoundError extends AppError {
    constructor(description = "Resource Not Found") {
        super("Not Found", STATUS_CODES.NOT_FOUND, description, true);
    }
}

/**
 * 409 - Conflict Error
 */
class ConflictError extends AppError {
    constructor(description = "Conflict Occurred") {
        super("Conflict", STATUS_CODES.CONFLICT, description, true);
    }
}

/**
 * 500 - Internal Server Error
 */
class InternalServerError extends AppError {
    constructor(description = "Internal Server Error") {
        super("Internal Error", STATUS_CODES.INTERNAL_ERROR, description, false);
    }
}

/**
 * Unified Error Response Handler (for Express.js)
 */
// const errorHandler = (error, req, res, next) => {
//     console.error("🔥 Error Intercepted:", {
//         name: error.name,
//         statusCode: error.statusCode || 500,
//         message: error.message,
//         stack: process.env.NODE_ENV === "development" ? error.stack : "Hidden",
//     });

//     res.status(error.statusCode || 500).json({
//         success: false,
//         statusCode: error.statusCode || 500,
//         error: error.name,
//         message: error.message,
//     });
// };

module.exports = {
    STATUS_CODES,
    AppError,
    APIError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
};
