const mongoose = require('mongoose');
require('dotenv').config();

// Models
require('./models/User');
require('./models/WaterUsage');
require('./models/Badge');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aquaventure', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    initializeDatabase();
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

async function initializeDatabase() {
    try {
        // Clear existing data
        await mongoose.connection.dropDatabase();
        console.log('Cleared existing database');

        // Create initial badges
        const Badge = mongoose.model('Badge');
        const initialBadges = [
            {
                type: 'welcome',
                name: 'Welcome Aboard',
                description: 'Join the water conservation journey!'
            },
            {
                type: 'first_entry',
                name: 'First Drop',
                description: 'Log your first water usage'
            },
            {
                type: 'water_saver',
                name: 'Water Saver',
                description: 'Use less than 160L in a day'
            },
            {
                type: 'streak_7',
                name: 'Week Warrior',
                description: 'Maintain a 7-day logging streak'
            },
            {
                type: 'streak_30',
                name: 'Conservation Champion',
                description: 'Maintain a 30-day logging streak'
            }
        ];

        await Badge.insertMany(initialBadges);
        console.log('Created initial badges');

        console.log('Database initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}
