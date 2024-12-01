const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    picture: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    waterUsageGoal: {
        type: Number,
        default: 100 // Default daily water usage goal in liters
    },
    badges: [{
        type: {
            type: String,
            enum: ['bronze', 'silver', 'gold']
        },
        earnedAt: Date,
        category: {
            type: String,
            enum: ['weekly', 'competition', 'streak']
        }
    }],
    streak: {
        current: { type: Number, default: 0 },
        best: { type: Number, default: 0 },
        lastCalculated: Date
    },
    settings: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'ocean'],
            default: 'light'
        },
        notifications: {
            daily: { type: Boolean, default: true },
            achievements: { type: Boolean, default: true },
            competitions: { type: Boolean, default: true }
        },
        preferredCalculationTime: {
            type: String,
            default: '21:00' // Default reminder time (9 PM)
        }
    },
    totalWaterSaved: {
        type: Number,
        default: 0
    },
    activeCompetitions: [{
        type: Schema.Types.ObjectId,
        ref: 'Competition'
    }],
    competitionInvites: [{
        from: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        goal: Number,
        duration: Number,
        sentAt: Date
    }]
}, {
    timestamps: true
});

// Index for location-based queries
userSchema.index({ location: '2dsphere' });

// Method to calculate badge eligibility
userSchema.methods.checkWeeklyBadgeEligibility = async function(waterSaved) {
    if (waterSaved >= 3000) return 'gold';
    if (waterSaved >= 1000) return 'silver';
    if (waterSaved >= 500) return 'bronze';
    return null;
};

// Method to update streak
userSchema.methods.updateStreak = function(didCalculateToday) {
    const today = new Date();
    const lastCalculated = this.streak.lastCalculated;
    
    if (!lastCalculated) {
        this.streak.current = didCalculateToday ? 1 : 0;
    } else {
        const daysDiff = Math.floor((today - lastCalculated) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1 && didCalculateToday) {
            this.streak.current += 1;
            this.streak.best = Math.max(this.streak.current, this.streak.best);
        } else if (daysDiff > 1) {
            this.streak.current = didCalculateToday ? 1 : 0;
        }
    }
    
    if (didCalculateToday) {
        this.streak.lastCalculated = today;
    }
};

module.exports = mongoose.model('User', userSchema);
