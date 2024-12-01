const mongoose = require('mongoose');

const waterUsageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    totalUsage: {
        type: Number,
        required: true
    },
    breakdown: {
        shower: Number,
        toilet: Number,
        teeth: Number,
        dishwashing: Number,
        laundry: Number,
        outdoor: Number
    }
});

module.exports = mongoose.model('WaterUsage', waterUsageSchema);
