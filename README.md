# Aquaventure - Water Usage Tracker

A comprehensive water conservation application with real-time usage tracking and Google authentication.

## Setup Instructions

### 1. Install MongoDB

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
   --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - http://localhost:3000
   - http://localhost:8000
6. Copy your Client ID and update it in `.env` file

### 3. Configure Email (for reminders)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password
4. Update EMAIL_USER and EMAIL_PASS in `.env` file

### 4. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Initialize database
node init-db.js

# Start the server
npm start
```

### 5. Access the Application

Open your browser and go to:
- http://localhost:8000/login.html

## Features

- Google Sign-In
- Real-time water usage tracking
- Daily usage calculator
- Interactive dashboard
- Achievement badges
- Water conservation chatbot
- Daily reminders
- Profile management
- Multiple themes

## File Structure

- `/models` - Database models
- `/public` - Frontend files
- `server.js` - Main server file
- `init-db.js` - Database initialization
- `.env` - Configuration file

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: Google OAuth 2.0
- Email: Nodemailer
