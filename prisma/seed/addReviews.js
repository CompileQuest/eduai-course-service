import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();


// Helper function to generate random reviews
const generateReview = (courseId) => {
    const comments = [
        "Great course! Learned a lot.",
        "Very informative and well-structured.",
        "The instructor was excellent.",
        "Loved the hands-on projects.",
        "Could be more challenging.",
        "Some sections were a bit rushed.",
        "Highly recommended!",
        "The course material was up-to-date.",
        "The quizzes were very helpful.",
        "I wish there were more real-world examples.",
    ];

    return {
        courseId: courseId,
        userId: uuidv4(), // Randomize userId for now
        rating: parseFloat((Math.random() * 4 + 1).toFixed(1)), // Random rating between 1.0 and 5.0
        comment: comments[Math.floor(Math.random() * comments.length)], // Random comment
    };
};

// Main function to add reviews to all courses
async function main() {
    console.log("Starting to add reviews...");

    // Fetch all courses
    const courses = await prisma.course.findMany();
    if (courses.length === 0) {
        console.error("No courses found. Please run the course seed file first.");
        process.exit(1);
    }

    // Loop through each course and add reviews
    for (const course of courses) {
        const numReviews = Math.floor(Math.random() * 91) + 10; // Random number of reviews between 10 and 100
        console.log(`Adding ${numReviews} reviews to course: ${course.title}`);

        for (let r = 0; r < numReviews; r++) {
            const review = generateReview(course.id);
            await prisma.review.create({
                data: review,
            });
            console.log(`  Added Review ${r + 1} for Course: ${course.title}`);
        }
    }

    console.log("Review seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });