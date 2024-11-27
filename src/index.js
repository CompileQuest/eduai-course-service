// index.js
// src/index.js
const express = require('express');
const expressApp = require('./express-app');  // Import expressApp function from expressapp.js
const { PORT } = require('./config');  // Import PORT from the config


const StartServer = async () => {
    const app = express();  // Initialize Express app

    // Await the expressApp function which configures the app
    await expressApp(app);

    // Start listening on the configured port
    app.listen(PORT, () => {
        console.log(`Course Service is running on port ${PORT}`);
    });
};

StartServer();
