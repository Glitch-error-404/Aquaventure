require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const socketIo = require('socket.io');
const http = require('http');
const moment = require('moment-timezone');
const { body, validationResult } = require('express-validator');
const geolib = require('geolib');

const app = express();
const server = http.createServer(app);

// Production-ready Socket.IO setup
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'https://glitch-error-404.github.io',
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://glitch-error-404.github.io',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Enhanced MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/views/dashboard.html');
});

app.get('/calculator', (req, res) => {
    res.sendFile(__dirname + '/views/calculator.html');
});

app.get('/discover', (req, res) => {
    res.sendFile(__dirname + '/views/discover.html');
});

app.get('/leaderboard', (req, res) => {
    res.sendFile(__dirname + '/views/leaderboard.html');
});

app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/views/about.html');
});

// 404 route
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/views/404.html');
});

// Models
const User = require('./models/User');
const WaterUsage = require('./models/WaterUsage');
const Badge = require('./models/Badge');
const Competition = require('./models/Competition');

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`);
    });
    
    socket.on('join-competition', (competitionId) => {
        socket.join(`competition-${competitionId}`);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) throw new Error();

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Auth Routes
app.post('/api/auth/google', async (req, res) => {
    try {
        console.log('Received auth request');
        
        const { token } = req.body;
        console.log('Token received:', token ? 'Yes' : 'No');

        if (!token) {
            console.error('No token provided');
            return res.status(400).json({ error: 'No token provided' });
        }

        // Verify the token
        console.log('Verifying token with Google...');
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        }).catch(error => {
            console.error('Token verification failed:', error);
            throw new Error(`Token verification failed: ${error.message}`);
        });

        console.log('Token verified successfully');
        const payload = ticket.getPayload();
        console.log('User email:', payload.email);

        try {
            // Check if user exists
            let user = await User.findOne({ email: payload.email });
            console.log('Existing user found:', user ? 'Yes' : 'No');

            if (!user) {
                console.log('Creating new user');
                // Create new user
                user = new User({
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    googleId: payload.sub
                });
                await user.save();
                console.log('New user created successfully');
            }

            // Generate JWT
            console.log('Generating JWT token');
            const jwtToken = jwt.sign(
                { 
                    userId: user._id, 
                    email: user.email,
                    name: user.name
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('Authentication successful');
            res.json({ 
                token: jwtToken, 
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture
                }
            });

        } catch (dbError) {
            console.error('Database operation failed:', dbError);
            throw new Error(`Database operation failed: ${dbError.message}`);
        }

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ 
            error: 'Authentication failed', 
            message: error.message,
            details: error.stack
        });
    }
});

// User Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('activeCompetitions');
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.patch('/api/user/settings', authenticateToken, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['waterUsageGoal', 'settings'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Water Usage Routes
app.post('/api/water-usage', authenticateToken, async (req, res) => {
    try {
        const waterUsage = new WaterUsage({
            ...req.body,
            user: req.user._id,
            date: new Date()
        });
        
        await waterUsage.save();
        const waterSaved = await waterUsage.calculateWaterSaved();
        
        // Update user's total water saved
        req.user.totalWaterSaved += waterSaved;
        await req.user.save();
        
        // Update competitions
        const activeCompetitions = await Competition.find({
            'participants.user': req.user._id,
            status: 'active'
        });
        
        for (const competition of activeCompetitions) {
            await competition.updateProgress(req.user._id, waterSaved);
            await competition.save();
            
            io.to(`competition-${competition._id}`).emit('competition-update', {
                competitionId: competition._id,
                update: 'progress'
            });
        }
        
        // Check for weekly badge eligibility
        const weeklyStats = await WaterUsage.getWeeklyStats(req.user._id);
        if (weeklyStats.length > 0) {
            const badgeType = await req.user.checkWeeklyBadgeEligibility(weeklyStats[0].totalSaved);
            if (badgeType) {
                const newBadge = {
                    type: badgeType,
                    earnedAt: new Date(),
                    category: 'weekly'
                };
                req.user.badges.push(newBadge);
                await req.user.save();
                
                io.to(`user-${req.user._id}`).emit('new-badge', newBadge);
            }
        }
        
        res.status(201).send(waterUsage);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Competition Routes
app.post('/api/competitions/invite', authenticateToken, async (req, res) => {
    try {
        const { targetUserId, goal, duration } = req.body;
        const targetUser = await User.findById(targetUserId);
        
        if (!targetUser) {
            return res.status(404).send({ error: 'User not found' });
        }
        
        targetUser.competitionInvites.push({
            from: req.user._id,
            goal,
            duration,
            sentAt: new Date()
        });
        
        await targetUser.save();
        io.to(`user-${targetUserId}`).emit('competition-invite', {
            from: req.user.name,
            goal,
            duration
        });
        
        res.send({ message: 'Invitation sent successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/api/competitions/accept', authenticateToken, async (req, res) => {
    try {
        const { inviteId } = req.body;
        const invite = req.user.competitionInvites.id(inviteId);
        
        if (!invite) {
            return res.status(404).send({ error: 'Invite not found' });
        }
        
        const competition = new Competition({
            participants: [
                { user: invite.from },
                { user: req.user._id }
            ],
            startDate: new Date(),
            endDate: new Date(Date.now() + invite.duration * 24 * 60 * 60 * 1000),
            goal: invite.goal,
            status: 'active'
        });
        
        await competition.save();
        
        req.user.activeCompetitions.push(competition._id);
        req.user.competitionInvites.pull(inviteId);
        await req.user.save();
        
        const opponent = await User.findById(invite.from);
        opponent.activeCompetitions.push(competition._id);
        await opponent.save();
        
        io.to(`user-${invite.from}`).emit('competition-started', {
            competitionId: competition._id
        });
        
        res.send(competition);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Leaderboard Routes
app.get('/api/leaderboard', async (req, res) => {
    try {
        const users = await User.find({})
            .sort({ totalWaterSaved: -1 })
            .limit(10)
            .select('name picture totalWaterSaved');
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Discover Routes
app.get('/api/discover/nearby', authenticateToken, async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        const nearbyUsers = await User.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: 50000 // 50km radius
                }
            },
            _id: { $ne: req.user._id }
        }).limit(20).select('name picture totalWaterSaved');
        
        res.send(nearbyUsers);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Chatbot Route
app.post('/api/chatbot', authenticateToken, async (req, res) => {
    const { usage } = req.body;
    let message = '';
    let tips = [];

    if (usage > 200) {
        tips = [
            "Install water-efficient showerheads and faucets",
            "Fix any leaking taps or pipes immediately",
            "Collect rainwater for gardening",
            "Use short cycles for dishwasher and washing machine",
            "Take shorter showers"
        ];
    } else if (usage > 100) {
        tips = [
            "Great job on moderate usage! Here are some tips to save more:",
            "Use a bucket to collect water while waiting for shower to warm up",
            "Water plants early morning or late evening",
            "Use a broom instead of hose for cleaning outdoors"
        ];
    } else {
        tips = [
            "Excellent water conservation! Keep up the good work!",
            "Share your water-saving techniques with friends",
            "Consider starting a water-saving competition"
        ];
    }

    message = {
        usage_category: usage > 200 ? 'high' : usage > 100 ? 'moderate' : 'low',
        message: `Based on your daily usage of ${usage}L:`,
        tips: tips
    };

    res.send(message);
});

// Schedule daily notifications
schedule.scheduleJob('0 21 * * *', async () => {
    try {
        const users = await User.find({
            'settings.notifications.daily': true
        });
        
        for (const user of users) {
            const userTime = moment().tz(user.timezone);
            if (userTime.format('HH:mm') === user.settings.preferredCalculationTime) {
                io.to(`user-${user._id}`).emit('daily-reminder', {
                    message: "Don't forget to log your water usage for today!"
                });
            }
        }
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
});

// Initialize badges
Badge.initializeDefaultBadges();

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
