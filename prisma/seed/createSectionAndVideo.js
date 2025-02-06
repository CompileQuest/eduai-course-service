const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const courseId = "7319945c-8de1-4a29-83e1-e4d71d330d03";

    console.log("Seeding sections and videos...");

    for (let i = 1; i <= 5; i++) {
        const section = await prisma.section.create({
            data: {
                courseId,
                sectionTitle: `Section ${i}`,
                order: i,
                videos: {
                    create: Array.from({ length: 5 }).map((_, index) => ({
                        title: `Video ${index + 1} - Section ${i}`,
                        description: `Description for Video ${index + 1} in Section ${i}`,
                        publicId: `video_${i}_${index + 1}`,
                        originalSize: Math.floor(Math.random() * 500 + 100), // Random size between 100-600 MB
                        compressedSize: Math.floor(Math.random() * 300 + 50), // Random size between 50-350 MB
                        duration: Math.floor(Math.random() * 900 + 300), // Random duration between 5-20 min
                    })),
                },
            },
        });

        console.log(`Created: ${section.sectionTitle}`);
    }

    console.log("Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
