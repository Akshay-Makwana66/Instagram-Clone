const { text } = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userRegistrationSchema = new mongoose.Schema({
    profileImage:{
        type: String,
    },
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
        required: true,
        unique:true
    },
    gender:{
        type: String,
        enum:["Male", "Female", "Other"],
        required:true
    },
    mobile:{
        type: Number,
        required: true,
        unique: true
    },
    profileStatus:{
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
    followingTo: [{
        type: ObjectId,
        ref: 'UserRegistration',
    }],
    sharedBy: [{
        user:{
            type: ObjectId,
            ref: 'UserRegistration'
        },
        post:{
            type:ObjectId,
            ref:'UserPost'
        }
    }],
    sharedTo: [{
        user:{
            type: ObjectId,
            ref: 'UserRegistration'
        },
        post:{
            type:ObjectId,
            ref:'UserPost'
        }  
    }],
    blockedUserCount:{
        type: Number,
        default:0
    },
    blockedUser: [{
        type: ObjectId,
        ref: 'UserRegistration',
    }],
    email_verified:{
        type:Boolean,
        default:false
    },
    isLogout:{
        type: Boolean,   
        default: false
    },
    isDeactivated: {
        type: Boolean,
        default: false
    },
    deactivationEndDate: {
        type: Date,
        default: null
    },
    isDeleted:{
        type: Boolean,   
        default: false
    },
    deletedAt: { 
      type: Date,
      default: null }

}, {timestamps:true})

module.exports = mongoose.model('UserRegistration', userRegistrationSchema)