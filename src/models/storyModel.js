const mongoose = require('mongoose');
const { Schema } = mongoose;

const storySchema = new Schema({ 
    user: {
        type: Schema.Types.ObjectId,
        ref: 'UserRegistration'
    },   
    content: {
        type: String,
        required: true
    },
    viewers: [{
        _id: false, // Specify _id to be false to avoid generating additional _id field
        user:{
            type: Schema.Types.ObjectId,
            ref: 'UserRegistration'
        }
    }],
    viewersCount: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 60 * 60 * 1000 // 24 hours from creation
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Index for expiration
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);
