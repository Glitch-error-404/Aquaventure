const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    earnedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Badge', badgeSchema);
