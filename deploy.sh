#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Aquaventure deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check for required environment variables
required_vars=("JWT_SECRET" "GOOGLE_CLIENT_ID" "EMAIL_USER" "EMAIL_PASS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "📦 Building Docker images..."
docker-compose build

echo "🧹 Cleaning up old containers..."
docker-compose down --remove-orphans

echo "🚀 Starting new containers..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful! Services are running."
    echo "📊 MongoDB is available at mongodb://localhost:27017"
    echo "🌐 Application is running at http://localhost:3000"
else
    echo "❌ Deployment failed. Please check the logs with 'docker-compose logs'"
    exit 1
fi

# Display logs
echo "📝 Recent logs:"
docker-compose logs --tail=50
