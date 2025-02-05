# Check if the migration folder exists and delete it
if [ -d "prisma/migrations" ]; then
    rm -rf prisma/migrations
fi

npx prisma migrate dev --name init

node prisma/seed/categorySeed.js