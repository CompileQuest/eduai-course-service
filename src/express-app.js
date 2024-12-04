// express-app.js
const express = require('express');
const cors = require('cors');
const { databaseConnection } = require('./database/connection');
const { AppError } = require('./utils/app-errors');
const HandleErrors = require('./utils/error-handler');

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
    require('./api/routes/video')(app);   // Import video routes


    // Handle 404 Errors
  app.use(HandleErrors);
};
