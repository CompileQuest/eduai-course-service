const { createLogger, transports } = require('winston');
const { AppError , STATUS_CODES } = require('./app-error.js');


const LogErrors = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app_error.log' })
    ]
});


class ErrorLogger {
    constructor() { }

    async logError(err) {
        // Capture the current date and time for the log entry
        const timestamp = new Date().toISOString();

        console.log('==================== Start Error Logger ===============');
        console.log(`Error Type: ${err.name}`); // Log the type of the error (e.g., TypeError)
        console.log('\n')
        console.log(`=====Error Message Start Here=====`); // Log the message associated with the error
        console.log('\n')
        console.log(`Error Message: ${err.message}`); // Log the message associated with the error
        console.log('\n')
        console.log(`=====Error Message ends Here======`); // Log the message associated with the error
        console.log('\n')
        console.log(`===========Error stack Starts here =========`)
        console.log('\n')
        console.log(`Error Stack: ${err.stack}`); // Log the stack trace for more details
        console.log('\n')
        console.log(`===========Error stack Ends here =========`)
        console.log('\n')


        console.log('==================== End Error Logger ===============');

        // This is a winston loger can use it or get rid of it for now i prefer mine the custome format i in the above code
        LogErrors.log({
            private: true,
            level: 'error',
            message: `${timestamp} - Error Type: ${err.name}, Message: ${err.message}, Stack: ${err.stack}`
        });

        return false;
    }

    isTrustError(error) {
        if (error instanceof AppError) {
            return error.isOperational;
        } else {
            return false;
        }
    }
}

const ErrorHandler = async (err, req, res, next) => {
    const errorLogger = new ErrorLogger();

    // Log the error
    await errorLogger.logError(err);

    // Determine the response data
    const statusCode = err.statusCode || STATUS_CODES.INTERNAL_ERROR; // Default to 500 if statusCode is missing
    const response = {
        success: false,
        statusCode: statusCode,
        error: err.name || 'API Error', // Error name (e.g., "BadRequestError", "ValidationError")
        message: err.message || 'Internal Server Error', // Error message
        description: err.description || 'No description provided', // Error description
    };

    // If the error has additional details (e.g., errorStack), include them in the response
    if (err.errorStack) {
        response.stack = err.errorStack; // Include the error stack trace
    }

    // Check if the error is trusted (operational)
    if (errorLogger.isTrustError(err)) {
        return res.status(statusCode).json(response);
    }

    // If the error is not trusted, log it and respond with a generic error message
    console.error('🔥 Critical Error:', err);
    return res.status(500).json({
        success: false,
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Something went wrong!',
        description: 'An unexpected error occurred. Please try again later.',
    });
};

module.exports = ErrorHandler;