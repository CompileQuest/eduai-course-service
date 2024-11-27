// database/connection.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.dev' });  // Load .env.dev

const databaseConnection = async () => {
    try {
        const dbURI = process.env.MONGODB_URI;

        if (!dbURI) {
            console.error('MongoDB URI not found in environment variables!');
            process.exit(1);
        }

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

module.exports = { databaseConnection };  // Export the function
