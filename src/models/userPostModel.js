const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userPostSchema = new mongoose.Schema({
    userId:{
        type: ObjectId,
        // required: true,
        ref:"UserRegistration",
    },
    text:{
        type: String
    },
    images: {
      type: [String], // Array of strings to store multiple image paths
      default: []
  },
  videos: {
    type: [String], // Array of strings to store multiple image paths
    default: []
},
    postStatus:{
        type: String,
        enum:["Public", "Private"],
        default: "Public"
    },
   
    likes:{
        type: Number,
        default:0
    },
    likesBy: [{
      type: ObjectId,
      ref: 'UserRegistration',
  }],
    
    friendTags: [{
        type: ObjectId,
        ref: 'UserRegistration',
      }],
    commentCount:{
        type: Number,
        default:0
    },
    comments: [{
        user: {
          type: ObjectId,
          ref: 'UserRegistration',
        //   required: true,
        },
        text: {
            type:String
        },
        subComments: [{
          user: {
            type: ObjectId,
            ref: 'UserRegistration',
            // required: true,
          },
          text: {
            type:String    
        },
        }],
      }],  
      postTime: {
        type: Date,
        default: () => {
            // Get current UTC time
            const utcTime = new Date();
            // Adjust UTC time to IST (+5 hours and 30 minutes)
            const istTime = new Date(utcTime.getTime() + (5.5 * 60 * 60 * 1000));
            return istTime;
        }
    },
    isDeleted:{
        type: Boolean,   
        default: false
    },
    deletedAt: { 
      type: Date,
      default: null }
},{timestamps:true})
module.exports = mongoose.model('UserPost', userPostSchema)