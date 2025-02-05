// Load environment variables based on NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'dev' ? '.env' : '.env'; // for now we are using the same env file for dev and prod    
require('dotenv').config({ path: envFile });

// Define required environment variables
const requiredEnvVars = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL
};

// Check if all required environment variables exist
const missingVars = [];
for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
        missingVars.push(key);
    }
}

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
} else {
    console.log('✅ All environment variables loaded successfully');
}

module.exports = {
    PORT: requiredEnvVars.PORT,
    DATABASE_URL: requiredEnvVars.DATABASE_URL,
};  // Export PORT, DATABASE_URL
