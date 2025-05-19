#!/bin/bash

echo "🔥 Starting Prisma Migration Process..."

# Check if the migration folder exists and delete it
if [ -d "prisma/migrations" ]; then
    echo "🧹 Removing existing migrations..."
    rm -rf prisma/migrations
    sleep 1
fi

# Run migrations
echo "🚀 Running Prisma Migrations..."
npx prisma migrate dev --name init
sleep 1

# Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
npx prisma generate
sleep 1

# Run seed scripts
echo "🌱 Seeding the database..."
node prisma/seed/categorySeed.js
sleep 1

echo "✅ Database setup complete!"
