#!/bin/bash

# Create directory structure
mkdir -p public/js public/css public/images

# Move HTML files to public
mv *.html public/ 2>/dev/null || true

# Move JavaScript files to public/js
mv public/js/config.js public/js/ 2>/dev/null || true

# Install MongoDB if not installed
if ! command -v mongod &> /dev/null; then
    echo "Installing MongoDB..."
    sudo apt-get update
    sudo apt-get install -y mongodb
    sudo systemctl start mongodb
    sudo systemctl enable mongodb
fi

# Install Node.js dependencies
npm install

# Initialize database
node init-db.js

# Start servers
echo "Starting Node.js server..."
node server.js &

echo "Starting Python server..."
python3 server.py
