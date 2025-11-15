#!/bin/bash

# Database Setup Script
# Sets up database migrations and seeds initial data

set -e

echo "=== Database Setup ==="

# Navigate to API project directory
cd "$(dirname "$0")/../src/SocialNetwork.API"

# Check if dotnet-ef is installed
if ! dotnet tool list --global | grep -q dotnet-ef; then
    echo "Installing EF Core tools..."
    dotnet tool install --global dotnet-ef
fi

# Add initial migration if not exists
if [ ! -d "../SocialNetwork.Infrastructure/Persistence/Migrations" ] || [ -z "$(ls -A ../SocialNetwork.Infrastructure/Persistence/Migrations)" ]; then
    echo "Creating initial migration..."
    dotnet ef migrations add InitialCreate \
        --project ../SocialNetwork.Infrastructure \
        --startup-project . \
        --output-dir Persistence/Migrations
else
    echo "Migrations directory already exists"
fi

# Update database
echo "Updating database..."
dotnet ef database update \
    --project ../SocialNetwork.Infrastructure \
    --startup-project .

echo "=== Database Setup Complete ==="
