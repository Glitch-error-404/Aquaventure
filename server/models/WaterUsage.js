const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const waterUsageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    totalUsage: {
        type: Number,
        required: true
    },
    breakdown: {
        shower: Number,
        bath: Number,
        toilet: Number,
        dishes: Number,
        laundry: Number,
        drinking: Number,
        cooking: Number,
        cleaning: Number,
        gardening: Number,
        other: Number
    },
    waterSaved: {
        type: Number,
        default: 0
    },
    notes: String
}, {
    timestamps: true
});

// Index for efficient date-based queries
waterUsageSchema.index({ user: 1, date: -1 });

// Method to calculate water saved based on average usage
waterUsageSchema.methods.calculateWaterSaved = async function() {
    const averageUsage = 150; // Average daily water usage in liters
    this.waterSaved = Math.max(0, averageUsage - this.totalUsage);
    return this.waterSaved;
};

// Static method to get weekly stats
waterUsageSchema.statics.getWeeklyStats = async function(userId) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return this.aggregate([
        {
            $match: {
                user: mongoose.Types.ObjectId(userId),
                date: { $gte: weekAgo }
            }
        },
        {
            $group: {
                _id: null,
                totalUsage: { $sum: '$totalUsage' },
                totalSaved: { $sum: '$waterSaved' },
                avgUsage: { $avg: '$totalUsage' },
                days: { $sum: 1 }
            }
        }
    ]);
};

module.exports = mongoose.model('WaterUsage', waterUsageSchema);
