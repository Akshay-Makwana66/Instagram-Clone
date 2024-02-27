// Import necessary modules
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// Define the schema for the story
const storySchema = new mongoose.Schema({
    stories: [{
        user: {
            type: ObjectId,
            ref: 'UserRegistration'
        },
        stories: {
            type: [String],
            default: []
        },
        // expiresAt: {
        //     type: Date,
        //     default: function() {
        //         // Calculate IST offset in milliseconds
        //         const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds

        //         // Calculate expiration time 60 seconds from now in IST
        //         const expirationTime = new Date(Date.now() + (60 * 1000) + istOffset);

        //         return expirationTime;
        //     }
        // },
        expiresAt: {
            type: Date,
            default: () => Date.now() + 60 * 1000 // 24 hours from creation
        },
    
        viewers: [{
            viewersCount: {
                type: Number,
                default: 0
            },
            viewBy: {
                type: ObjectId,
                ref: 'UserRegistration'
            }
        }]
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });


// Define TTL index on expiresAt field inside each story object
storySchema.index({"stories.expiresAt": 1 }, { expireAfterSeconds: 0 });

// Create and export the Story model
module.exports = mongoose.model('Story', storySchema);
