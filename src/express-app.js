// express-app.js
const express = require('express');
const cors = require('cors');
const { databaseConnection } = require('./database/connection');


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

  
  app.use((err, req, res, next) => {  // <-- Use "err" instead of "error"
    console.log("🔥 Intercepted error:", err);

    let statusCode = err.statusCode || 500;

    // Force 500 errors to appear as 404
    if (statusCode === 500) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      statusCode,
      message: err.message || "Custom error response"
    });
  });

  
  
};
