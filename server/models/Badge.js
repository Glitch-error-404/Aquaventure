const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const badgeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['bronze', 'silver', 'gold'],
        required: true
    },
    category: {
        type: String,
        enum: ['weekly', 'competition', 'streak'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    criteria: {
        waterSaved: Number,  // For weekly badges
        competitions: Number, // For competition badges
        streakDays: Number   // For streak badges
    },
    icon: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Default badges
const defaultBadges = [
    {
        name: 'Weekly Water Saver - Bronze',
        type: 'bronze',
        category: 'weekly',
        description: 'Save 500L of water in a week',
        criteria: { waterSaved: 500 },
        icon: '🥉'
    },
    {
        name: 'Weekly Water Saver - Silver',
        type: 'silver',
        category: 'weekly',
        description: 'Save 1000L of water in a week',
        criteria: { waterSaved: 1000 },
        icon: '🥈'
    },
    {
        name: 'Weekly Water Saver - Gold',
        type: 'gold',
        category: 'weekly',
        description: 'Save 3000L of water in a week',
        criteria: { waterSaved: 3000 },
        icon: '🥇'
    },
    {
        name: 'Competition Champion - Bronze',
        type: 'bronze',
        category: 'competition',
        description: 'Win 5 friendly competitions',
        criteria: { competitions: 5 },
        icon: '🏆'
    },
    {
        name: 'Competition Champion - Silver',
        type: 'silver',
        category: 'competition',
        description: 'Win 15 friendly competitions',
        criteria: { competitions: 15 },
        icon: '🏆'
    },
    {
        name: 'Competition Champion - Gold',
        type: 'gold',
        category: 'competition',
        description: 'Win 30 friendly competitions',
        criteria: { competitions: 30 },
        icon: '🏆'
    },
    {
        name: 'Consistency King - Bronze',
        type: 'bronze',
        category: 'streak',
        description: 'Maintain a 7-day streak',
        criteria: { streakDays: 7 },
        icon: '📅'
    },
    {
        name: 'Consistency King - Silver',
        type: 'silver',
        category: 'streak',
        description: 'Maintain a 30-day streak',
        criteria: { streakDays: 30 },
        icon: '📅'
    },
    {
        name: 'Consistency King - Gold',
        type: 'gold',
        category: 'streak',
        description: 'Maintain a 100-day streak',
        criteria: { streakDays: 100 },
        icon: '📅'
    }
];

// Static method to initialize default badges
badgeSchema.statics.initializeDefaultBadges = async function() {
    try {
        const count = await this.countDocuments();
        if (count === 0) {
            await this.insertMany(defaultBadges);
            console.log('Default badges initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing default badges:', error);
    }
};

module.exports = mongoose.model('Badge', badgeSchema);
