const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const competitionSchema = new Schema({
    participants: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        waterSaved: {
            type: Number,
            default: 0
        },
        dailyAverage: {
            type: Number,
            default: 0
        },
        progress: {
            type: Number,
            default: 0
        }
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    goal: {
        type: Number,
        required: true // Water saving goal in liters
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    winner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['friendly', 'ranked'],
        default: 'friendly'
    }
}, {
    timestamps: true
});

// Index for efficient queries
competitionSchema.index({ status: 1, startDate: -1 });
competitionSchema.index({ 'participants.user': 1 });

// Method to update participant progress
competitionSchema.methods.updateProgress = async function(userId, waterSaved) {
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (participant) {
        participant.waterSaved += waterSaved;
        participant.progress = (participant.waterSaved / this.goal) * 100;
        
        // Check if competition is completed
        if (participant.waterSaved >= this.goal) {
            this.status = 'completed';
            this.winner = userId;
        }
    }
};

// Method to calculate daily averages
competitionSchema.methods.calculateAverages = function() {
    const duration = (this.endDate - this.startDate) / (1000 * 60 * 60 * 24);
    this.participants.forEach(participant => {
        participant.dailyAverage = participant.waterSaved / duration;
    });
};

// Static method to get active competitions for a user
competitionSchema.statics.getActiveCompetitions = function(userId) {
    return this.find({
        'participants.user': userId,
        status: 'active',
        endDate: { $gt: new Date() }
    }).populate('participants.user', 'name picture');
};

module.exports = mongoose.model('Competition', competitionSchema);
