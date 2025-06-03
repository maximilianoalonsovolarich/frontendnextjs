#!/bin/bash

# Create the shared network if it doesn't exist
docker network inspect shared_network >/dev/null 2>&1 || \
    docker network create shared_network

# Check if .env.local exists, if not create it from example
if [ ! -f .env.local ]; then
    echo "Creating .env.local from .env.local.example"
    cp .env.local.example .env.local
    
    # Generate a random NEXTAUTH_SECRET
    RANDOM_SECRET=$(openssl rand -base64 32)
    sed -i "s/your-super-secret-nextauth-secret-key-at-least-32-chars/$RANDOM_SECRET/g" .env.local
    
    echo "Please review and update the values in .env.local if needed"
fi

# Check if required environment variables are set in .env.local
echo "Verifying required environment variables..."
REQUIRED_VARS=("BACKEND_URL" "OIDC_CLIENT_ID" "OIDC_CLIENT_SECRET" "OIDC_ISSUER" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
MISSING_VARS=false

for VAR in "${REQUIRED_VARS[@]}"; do
    VALUE=$(grep -E "^$VAR=" .env.local | cut -d= -f2)
    if [[ -z "$VALUE" || "$VALUE" == *"your-"* ]]; then
        echo "⚠️  Warning: $VAR is not set or has default value in .env.local"
        MISSING_VARS=true
    else
        echo "✅ $VAR is configured"
    fi
done

if [ "$MISSING_VARS" = true ]; then
    echo -e "\n⚠️  Some required environment variables are missing or have default values."
    echo "Please edit .env.local file before continuing."
    read -p "Do you want to continue anyway? (y/N): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        echo "Setup aborted. Please update .env.local and run setup.sh again."
        exit 1
    fi
fi

# Build and start the frontend container
docker-compose up -d

echo "Setup complete! The frontend application should be available at http://localhost:3000"
