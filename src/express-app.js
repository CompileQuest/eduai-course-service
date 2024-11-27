// express-app.js
const express = require('express');
const cors = require('cors');
const { databaseConnection } = require('./database/connection');  // Import correctly
const { AppError, ErrorHandler } = require('./utils/app-errors');

module.exports = async (app) => {
    // Middleware
    app.use(express.json());
    app.use(cors());

    // Connect to Database
    await databaseConnection();  // Call the function properly

    // Routes
    require('./api/routes/course')(app);

    // Handle 404 Errors
    app.use((req, res, next) => {
        const error = new AppError('Not Found', 404);
        next(error);
    });

    // Global Error Handler
    app.use((err, req, res, next) => {
        ErrorHandler(err, res);
    });
};
