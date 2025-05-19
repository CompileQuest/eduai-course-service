import express from 'express';
import cors from 'cors';
import { databaseConnection } from './database/connection.js';
import apiRoutes from './api/routes/index.js';
import ErrorHandler from './utils/error-handler.js';
import RabbitMQClient from './infrastructure/messageQueue/fireAndForget/RabbitMQClient.js';
// import index from './infrastructure/messageQueue/fireAndForget/index.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (app) => {
  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use(cookieParser());
  app.use(
    cors({
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
      credentials: true,
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Connect to Database
  await databaseConnection();

  // Routes
  apiRoutes(app);







  // import('./api/routes/v1/cloudinary.js').then((module) => module.default(app)); // Import cloudinary routes dynamically

  app.use(ErrorHandler);
};
