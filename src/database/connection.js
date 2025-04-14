import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const databaseConnection = async () => {
    try {
        // Prisma connects to PostgreSQL automatically when it is instantiated
        await prisma.$connect();
        console.log('PostgreSQL connected successfully');
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
        // process.exit(1);
    }
};

export { databaseConnection };
