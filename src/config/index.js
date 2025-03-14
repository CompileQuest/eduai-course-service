import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'dev' ? '.env' : '.env'; // using the same env file for now
dotenv.config({ path: envFile });

// Define required environment variables
const requiredEnvVars = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    TUNNEL_DOMAIN: process.env.TUNNEL_DOMAIN,
    RABBITMQ_URL: process.env.RABBITMQ_URL,
    SERVICE_NAME: process.env.SERVICE_NAME
};

// Check if all required environment variables exist
const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
} else {
    console.log('✅ All environment variables loaded successfully');
}

export const { PORT, DATABASE_URL, TUNNEL_DOMAIN, RABBITMQ_URL, SERVICE_NAME } = requiredEnvVars;
