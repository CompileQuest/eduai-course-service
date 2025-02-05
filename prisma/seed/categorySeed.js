const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Define your categories
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

    // Business & Professional
    { name: "Business Strategy" },
    { name: "Project Management" },
    { name: "Digital Marketing" },
    { name: "Entrepreneurship" },
    { name: "Finance & Accounting" },
    { name: "Leadership" },

    // Creative
    { name: "Graphic Design" },
    { name: "UI/UX Design" },
    { name: "Video Production" },
    { name: "Photography" },
    { name: "3D & Animation" },

    // Personal Development
    { name: "Personal Productivity" },
    { name: "Career Development" },
    { name: "Soft Skills" },
    { name: "Language Learning" },

    // Others
    { name: "Health & Fitness" },
    { name: "Music" },
    { name: "Teaching & Academics" },
  ];

  console.log("Start seeding categories...");

  // Create categories
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
