
Error: Cannot find module './models/Competition'
Require stack:
- /home/mahi/Documents/~ Aquaventure ~/server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1225:15)
    at Module._load (node:internal/modules/cjs/loader:1051:27)
    at Module.require (node:internal/modules/cjs/loader:1311:19)
    at require (node:internal/modules/helpers:179:18)
    at Object.<anonymous> (/home/mahi/Documents/~ Aquaventure ~/server.js:75:21)
    at Module._compile (node:internal/modules/cjs/loader:1469:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1548:10)
    at Module.load (node:internal/modules/cjs/loader:1288:32)
    at Module._load (node:internal/modules/cjs/loader:1104:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:174:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [ '/home/mahi/Documents/~ Aquaventure ~/server.js' ]
}

Node.js v20.18.0
now doconst mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    notifications: {
        email: {
            type: Boolean,
            default: true
        },
        dailyReminder: {
            type: Boolean,
            default: true
        },
        achievements: {
            type: Boolean,
            default: true
        }
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'ocean'],
        default: 'ocean'
    },
    waterGoal: {
        type: Number,
        default: 160
    },
    badges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    }],
    streak: {
        current: {
            type: Number,
            default: 0
        },
        longest: {
            type: Number,
            default: 0
        },
        lastUpdate: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);
