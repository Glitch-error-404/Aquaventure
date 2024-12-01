# Aquaventure Backend

This is the backend server for the Aquaventure water conservation platform. It's built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with these variables:
```
PORT=3000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
FRONTEND_URL=https://your-github-pages-url
```

3. Start the server:
```bash
npm start
```

## Files Structure

- `server.js` - Main server file
- `models/` - MongoDB models
- `init-db.js` - Database initialization script

## Deployment

1. Create a MongoDB Atlas account and get your connection string
2. Deploy to Railway.app or similar platform:
   - Connect your GitHub repository
   - Set up environment variables
   - The platform will automatically deploy your app

## API Endpoints

- POST `/api/auth/google` - Google OAuth authentication
- GET `/api/user` - Get user profile
- POST `/api/water-usage` - Log water usage
- GET `/api/leaderboard` - Get leaderboard data

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `FRONTEND_URL` - Frontend URL for CORS
