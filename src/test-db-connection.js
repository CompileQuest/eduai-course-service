const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Successfully connected to the database');
    } catch (error) {
        console.error('❌ Failed to connect to the database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection(); 