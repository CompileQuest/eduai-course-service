// express-app.js
const express = require('express');
const cors = require('cors');
const { databaseConnection } = require('./database/connection');
const apiRoutes = require('./api/routes/index')
const errorHandler = require('./utils/error-handler');
const ErrorHandler = require('./utils/error-handler');
const RabbitMQClient = require('./infrastructure/messageQueue/fireAndForget/RabbitMQClient');
const index = require('./infrastructure/messageQueue/fireAndForget/index')
const cookieParser = require('cookie-parser');
module.exports = async (app) => {
  // Middleware
  app.use(express.json());
  app.use(cookieParser());
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
  apiRoutes(app);
  //require('./api/routes/v1/cloudinary')(app); // Import cloudinary routes


  app.use(ErrorHandler);



};
