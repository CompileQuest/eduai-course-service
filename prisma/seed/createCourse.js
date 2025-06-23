import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seeding...");

    // Fetch all categories
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
        console.error("No categories found. Please run the category seed file first.");
        process.exit(1);
    }

    // Fetch an instructor (assuming you have an `Instructor` or `User` model)
    const instructorId = "uuid_here_of_instructor_test"; // Change this if you have a separate `Instructor` model
    if (!instructorId) {
        console.error("No instructor found. Please create an instructor first.");
        process.exit(1);
    }

    // Helper function to generate random course data
    const generateCourseData = (index) => {
        const courseTitles = [
            "Full-Stack Web Development with Next.js and Express",
            "Mastering Cloud Computing with AWS",
            "Data Science with Python and Machine Learning",
            "Mobile App Development with Flutter",
            "Cybersecurity Fundamentals",
            "Advanced JavaScript and React",
            "DevOps with Docker and Kubernetes",
            "Blockchain Development with Solidity",
            "UI/UX Design with Figma",
            "Artificial Intelligence and Deep Learning",
            "Game Development with Unity",
            "Python for Data Analysis",
            "iOS Development with Swift",
            "Android Development with Kotlin",
            "Frontend Development with Vue.js",
            "Backend Development with Node.js",
            "Database Design with SQL",
            "Cloud Native Applications with Azure",
            "Ethical Hacking and Penetration Testing",
            "Full-Stack Development with Django",
            "Advanced CSS and Animations",
            "RESTful API Design",
            "GraphQL for Modern Applications",
            "Serverless Architecture with AWS Lambda",
            "Microservices with Spring Boot",
            "Big Data with Hadoop and Spark",
            "Natural Language Processing with Python",
            "AR/VR Development with Unity",
            "Quantum Computing Basics",
            "Advanced Algorithms and Data Structures",
        ];

        const difficulties = ["Beginner", "Intermediate", "Advanced"];
        const prices = [29.99, 49.99, 69.99, 99.99];
        const durations = [10, 20, 30, 40];

        // List of possible statuses
        const statuses = [
            "Draft",
            "Pending",
            "Approved",
            "Published",
            "Rejected",
            "Archived",
            "Suspended",
            "Under Review",
            "Expired",
            "Unpublished",
        ];

        // List of thumbnail URLs
        const thumbnailUrls = [
            "https://res.cloudinary.com/dzexoe2b8/image/upload/f_auto,q_auto/xj3nn8wp4eftpe05ganf",
            "https://res.cloudinary.com/dzexoe2b8/image/upload/f_auto,q_auto/zgjeib74l0w7mtyi2n8s",
            "https://res.cloudinary.com/dzexoe2b8/image/upload/f_auto,q_auto/gfo1mqxk9qo7kktmvoqv",
            "https://res.cloudinary.com/dzexoe2b8/image/upload/f_auto,q_auto/fdptwn3m1w3s9pufz8wx",
        ];

        return {
            title: courseTitles[index % courseTitles.length],
            shortDescription: `Learn how to build ${courseTitles[index % courseTitles.length].toLowerCase()}.`,
            difficultyLevel: difficulties[Math.floor(Math.random() * difficulties.length)],
            price: prices[Math.floor(Math.random() * prices.length)],
            discountedPrice: prices[Math.floor(Math.random() * prices.length)] - 10,
            requirements: "Basic programming knowledge",
            duration: durations[Math.floor(Math.random() * durations.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)], // Random status
            introductionVideoLink: `https://somevideo.com/intro${index + 1}`,
            description: `A complete guide to ${courseTitles[index % courseTitles.length].toLowerCase()}.`,
            WhatWillYouLearn: `How to build ${courseTitles[index % courseTitles.length].toLowerCase()}.`,
            thumbnailUrl: thumbnailUrls[Math.floor(Math.random() * thumbnailUrls.length)], // Random thumbnail URL
        };
    };

    // Define sample FAQs
    const faqs = [
        {
            question: "What is the course duration?",
            answer: "The course duration is approximately 20 hours.",
        },
        {
            question: "Do I need prior experience?",
            answer: "Basic knowledge of programming is recommended.",
        },
        {
            question: "Will I get a certificate?",
            answer: "Yes, you will receive a certificate upon completion.",
        },
        {
            question: "Can I access the course offline?",
            answer: "No, the course is only available online.",
        },
        {
            question: "Is there a money-back guarantee?",
            answer: "Yes, we offer a 30-day money-back guarantee.",
        },
    ];

    // Create 30 courses
    for (let i = 0; i < 30; i++) {
        const courseData = generateCourseData(i);
        const course = await prisma.course.create({
            data: {
                instructorId: instructorId, // Added instructorId here
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
        console.log(`Created Course ${i + 1}: ${course.title}`);

        // Create Sections
        for (let j = 1; j <= 3; j++) {
            const section = await prisma.section.create({
                data: {
                    courseId: course.id,
                    sectionTitle: `Section ${j} - Key Concepts`,
                    order: j,
                    quizId: `quiz_${uuidv4()}`,
                },
            });
            console.log(`  Added Section: ${section.sectionTitle}`);

            // Create Videos
            for (let k = 1; k <= 8; k++) {
                await prisma.video.create({
                    data: {
                        asset_id: uuidv4(),
                        public_id: `video_${uuidv4()}`,
                        secure_url: `https://somevideo.com/video${k}`,
                        sectionId: section.id,
                        title: `Lecture ${k} - Important Topic`,
                        format: "mp4",
                        width: 1920,
                        order: k,
                        height: 1080,
                        duration: Math.floor(Math.random() * 600) + 300, // Random duration (5-15 min)
                        bitRate: 4500,
                        frameRate: 30,
                        folder: "course_videos",
                        is_free: j % 2 == 0 ? true : false,
                    },
                });
                console.log(`    Added Video ${k} to ${section.sectionTitle}`);
            }

            // Create Files
            for (let l = 1; l <= 3; l++) {
                await prisma.file.create({
                    data: {
                        asset_id: uuidv4(),
                        public_id: `file_${uuidv4()}`,
                        secure_url: `https://somefile.com/file${l}`,
                        sectionId: section.id,
                        title: `Resource ${l} - Supplementary Material`,
                        format: "pdf",
                        bytes: 1024 * 1024, // 1 MB
                        type: "document",
                        folder: "course_files",
                        is_free: j % 2 == 0 ? true : false,
                    },
                });
                console.log(`    Added File ${l} to ${section.sectionTitle}`);
            }
        }

        // Create FAQs for the course
        for (const faq of faqs) {
            await prisma.fAQ.create({
                data: {
                    userId: instructorId, // Assuming the instructor is the one adding FAQs
                    courseId: course.id,
                    question: faq.question,
                    answer: faq.answer,
                },
            });
            console.log(`  Added FAQ: ${faq.question}`);
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