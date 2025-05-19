import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function main() {
  // Expanded list of categories
  const categories = [
    // Technology & Programming
    { name: "Web Development" },
    { name: "Mobile Development" },
    { name: "Programming Languages" },
    { name: "Database Design" },
    { name: "Cloud Computing" },
    { name: "DevOps" },
    { name: "Artificial Intelligence" },
    { name: "Data Science" },
    { name: "Cybersecurity" },
    { name: "Blockchain" },
    { name: "Internet of Things (IoT)" },
    { name: "Game Development" },

    // Business & Professional
    { name: "Business Strategy" },
    { name: "Project Management" },
    { name: "Digital Marketing" },
    { name: "Entrepreneurship" },
    { name: "Finance & Accounting" },
    { name: "Leadership" },
    { name: "Sales & Negotiation" },
    { name: "E-commerce" },
    { name: "Human Resources" },

    // Creative
    { name: "Graphic Design" },
    { name: "UI/UX Design" },
    { name: "Video Production" },
    { name: "Photography" },
    { name: "3D & Animation" },
    { name: "Interior Design" },
    { name: "Fashion Design" },
    { name: "Creative Writing" },

    // Personal Development
    { name: "Personal Productivity" },
    { name: "Career Development" },
    { name: "Soft Skills" },
    { name: "Language Learning" },
    { name: "Mindfulness & Meditation" },
    { name: "Public Speaking" },
    { name: "Time Management" },
    { name: "Emotional Intelligence" },

    // Social Sciences & Humanities
    { name: "Human Rights" },
    { name: "Social Justice" },
    { name: "Sociology" },
    { name: "Psychology" },
    { name: "Political Science" },
    { name: "International Relations" },
    { name: "Law & Society" },
    { name: "Gender Studies" },
    { name: "Ethics & Philosophy" },
    { name: "Cultural Studies" },
    { name: "Environmental Studies" },
    { name: "Global Studies" },

    // Teaching & Academics
    { name: "Teaching & Academics" },
    { name: "Educational Psychology" },
    { name: "Curriculum Development" },
    { name: "Early Childhood Education" },
    { name: "Instructional Design" },

    // Health & Wellness
    { name: "Health & Fitness" },
    { name: "Nutrition" },
    { name: "Mental Health" },
    { name: "Yoga & Wellness" },
    { name: "Sports & Exercise Science" },

    // Music & Arts
    { name: "Music" },
    { name: "Music Production" },
    { name: "Instruments & Singing" },
    { name: "Art History" },
    { name: "Painting & Drawing" },

    // Miscellaneous
    { name: "History" },
    { name: "Geography" },
    { name: "Economics" },
    { name: "Science & Nature" },
    { name: "Astronomy" },
    { name: "Critical Thinking" },
  ];

  console.log("Start seeding categories...");

  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: category,
    });
    console.log(`Created category: ${createdCategory.name}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
