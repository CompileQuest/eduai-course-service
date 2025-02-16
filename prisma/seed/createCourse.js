const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require("uuid");

async function main() {
    console.log("Starting seeding...");

    // Fetch all categories
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
        console.error("No categories found. Please run the category seed file first.");
        process.exit(1);
    }

    // Define sample courses
    const courses = [
        {
            title: "Full-Stack Web Development with Next.js and Express",
            shortDescription: "Learn how to build scalable web applications.",
            difficultyLevel: "Intermediate",
            price: 49.99,
            discountedPrice: 39.99,
            requirements: "Basic JavaScript knowledge",
            duration: 20,
            status: "draft",
            introductionVideoLink: "https://somevideo.com/intro1",
            description: "A complete guide to modern full-stack development.",
            WhatWillYouLearn: "How to build modern web applications.",
        },
        {
            title: "Mastering Cloud Computing with AWS",
            shortDescription: "Learn to deploy scalable cloud applications.",
            difficultyLevel: "Advanced",
            price: 69.99,
            discountedPrice: 59.99,
            requirements: "Basic networking knowledge",
            duration: 30,
            status: "draft",
            introductionVideoLink: "https://somevideo.com/intro2",
            description: "Deep dive into AWS cloud services.",
            WhatWillYouLearn: "Deploying, managing, and securing cloud apps.",
        },
    ];

    for (const courseData of courses) {
        const course = await prisma.course.create({
            data: {
                ...courseData,
                categories: {
                    create: {
                        category: {
                            connect: { id: categories[Math.floor(Math.random() * categories.length)].id },
                        },
                    },
                },
            },
        });
        console.log(`Created Course: ${course.title}`);

        // Create Sections
        for (let i = 1; i <= 3; i++) {
            const section = await prisma.section.create({
                data: {
                    courseId: course.id,
                    sectionTitle: `Section ${i} - Key Concepts`,
                    order: i,
                },
            });
            console.log(`  Added Section: ${section.sectionTitle}`);

            // Create Videos
            for (let j = 1; j <= 3; j++) {
                await prisma.video.create({
                    data: {
                        asset_id: uuidv4(),
                        public_id: `video_${uuidv4()}`,
                        secure_url: `https://somevideo.com/video${j}`,
                        sectionId: section.id,
                        title: `Lecture ${j} - Important Topic`,
                        format: "mp4",
                        width: 1920,
                        order:j,
                        height: 1080,
                        duration: Math.floor(Math.random() * 600) + 300, // Random duration (5-15 min)
                        bitRate: 4500,
                        frameRate: 30,
                        folder: "course_videos",
                    },
                });
                console.log(`    Added Video ${j} to ${section.sectionTitle}`);
            }
        }
    }

    console.log("Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
