const { createLogger, transports, format } = require('winston');
const chalk = require('chalk'); // Add this package for colorized output
const { AppError, STATUS_CODES } = require('./app-error.js');

// Winston Logger Setup
const LogErrors = createLogger({
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app_error.log' })
    ]
});

class ErrorLogger {
    async logError(err) {
        const timestamp = new Date().toISOString();

        console.log(chalk.red.bold('\n========= ERROR LOG ========='));
        console.log(chalk.yellow(`🔥 [${timestamp}]`));
        console.log(chalk.red.bold('Error Type:'), chalk.white(err.name || 'Unknown Error'));
        console.log(chalk.red.bold('Message:'), chalk.white(err.message || 'No message provided'));

        if (err.stack) {
            console.log(chalk.blue.bold('\nStack Trace:'));
            console.log(chalk.white(err.stack));
        }
        console.log(chalk.red.bold('=============================\n'));

        // Log error in file
        LogErrors.error({
            level: 'error',
            timestamp,
            name: err.name,
            message: err.message,
            stack: err.stack
        });
    }

    isTrustError(error) {
        return error instanceof AppError ? error.isOperational : false;
    }
}

const ErrorHandler = async (err, req, res, next) => {
    const errorLogger = new ErrorLogger();

    // Log the error
    await errorLogger.logError(err);

    // Determine response
    const statusCode = err.statusCode || STATUS_CODES.INTERNAL_ERROR;
    const response = {
        success: false,
        statusCode,
        error: err.name || 'Server Error',
        message: err.message || 'Something went wrong',
    };

    if (err.description) {
        response.description = err.description;
    }

    if (errorLogger.isTrustError(err)) {
        return res.status(statusCode).json(response);
    }

    // For unknown errors, hide details from the client
    return res.status(500).json({
        success: false,
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again later.',
    });
};

module.exports = ErrorHandler; 
