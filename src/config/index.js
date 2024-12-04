// Load environment variables from .env file
require('dotenv').config({ path: '.env' });  // Specify the .env file

const { PORT } = process.env;  // Access PORT from .env

// Check if PORT exists in environment variables
if (!PORT) {
    console.error('PORT not found in environment variables!');
    process.exit(1);  // Stop execution if no PORT is found
}

module.exports = { PORT };  // Export PORT
