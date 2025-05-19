#!/bin/bash

# Check if a migration name was provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide a migration name."
  echo "Usage: ./migrateChanges.sh <migration_name>"
  exit 1
fi

# Run Prisma migration
npx prisma migrate dev --name "$1"
