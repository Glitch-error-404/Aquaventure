#!/bin/bash

echo "Starting Aquaventure Application..."

# Start MongoDB
echo "1. Starting MongoDB..."
sudo systemctl start mongodb
if [ $? -eq 0 ]; then
    echo "✓ MongoDB started successfully"
else
    echo "✗ Failed to start MongoDB. Please install it first:"
    echo "  sudo apt-get install mongodb"
    exit 1
fi

# Start Backend Server (Node.js)
echo "2. Starting Backend Server (Port 3000)..."
node server.js &
BACKEND_PID=$!
sleep 2
if ps -p $BACKEND_PID > /dev/null; then
    echo "✓ Backend server started successfully"
    echo "  API running at: http://localhost:3000/api"
else
    echo "✗ Failed to start backend server"
    exit 1
fi

# Start Frontend Server (Python)
echo "3. Starting Frontend Server (Port 8000)..."
python3 server.py &
FRONTEND_PID=$!
sleep 2
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✓ Frontend server started successfully"
    echo "  Open this URL in your browser: http://localhost:8000/login.html"
else
    echo "✗ Failed to start frontend server"
    exit 1
fi

echo ""
echo "Application is running!"
echo "→ Open http://localhost:8000/login.html in your browser"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
