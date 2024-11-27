// config/index.js

// Load environment variables from .env.dev file
require('dotenv').config({ path: '.env.dev' });  // Specify the .env.dev file

const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const dbURI = process.env.MONGODB_URI;

        // Check if dbURI exists in environment variables
        if (!dbURI) {
            console.error('MongoDB URI not found in environment variables!');
            process.exit(1); // Stop execution if no URI is found
        }

        // Connect to MongoDB
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Stop execution on failure
    }
};

// Export the PORT from environment variables
const { PORT } = process.env;  // Access PORT from .env.dev

module.exports = { connectDB, PORT };  // Export connectDB and PORT
