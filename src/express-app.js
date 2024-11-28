// express-app.js
const express = require('express');
const cors = require('cors');
const { databaseConnection } = require('./database/connection');
const { AppError, ErrorHandler } = require('./utils/app-errors');

module.exports = async (app) => {
    // Middleware
    app.use(express.json());
    app.use(cors());

    // Connect to Database
    await databaseConnection();

    // Routes
    require('./api/routes/course')(app);   // Import course routes
    require('./api/routes/review')(app);  // Import review routes
    require('./api/routes/section')(app); // Import section routes

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
