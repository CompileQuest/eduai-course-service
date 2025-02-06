// express-app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { databaseConnection } = require('./database/connection');
const { AppError } = require('./utils/app-errors');
const HandleErrors = require('./utils/error-handler');

module.exports = async (app) => {
  // Middleware
  app.use(express.json());
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      try {
        const url = new URL(origin);
        const port = parseInt(url.port);
        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

        if (isLocalhost && port >= 3000 && port <= 4000) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } catch (err) {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files statically
  app.use('/uploads', express.static(__dirname + '/uploads'))

  // Connect to Database
  await databaseConnection();

  // Routes
  require('./api/routes/course')(app);   // Import course routes
  require('./api/routes/review')(app);  // Import review routes
  require('./api/routes/section')(app); // Import section routes
  require('./api/routes/video')(app);   // Import video routes
  require('./api/routes/cloudinary')(app); // Import cloudinary routes
  // Handle 404 Errors
  app.use(HandleErrors);
};
