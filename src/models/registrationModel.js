const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userRegistrationSchema = new mongoose.Schema({
    name:{
        type : String,
        required: true
    },
    emailId:{
        type:String,
        required: true,
    },
    password:{
        type:String,
        required: true,
    },
    userName:{                
        type : String,
        required: true
    },
    gender:{
        type: String,
        enum:["Male", "Female", "Other"],
    },
    mobile:{
        type: Number,
        required: true,
        unique: true
    },
    profile:{
        type: String,
        enum:["Public", "Private"],
        default: "Public"
    },
    followerCount:{
        type: Number,
        default:0
    },
    followedBy: [{
        type: ObjectId,
        ref: 'UserRegistration',
    }],
      
    followingCount:{
        type: Number,
        default:0
    },
    following: [{
        type: ObjectId,
        ref: 'UserRegistration',
    }],
    // blockerdUserCount:{
    //     type: Number,
    //     default:0
    // },
    blockedUser: [{
        type: ObjectId,
        ref: 'UserRegistration',
    }],
    is_varified:{
        type:Number,
        default:0
    }
}, {timestamps:true})

module.exports = mongoose.model('UserRegistration', userRegistrationSchema)