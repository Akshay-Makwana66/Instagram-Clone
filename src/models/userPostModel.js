const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userPostSchema = new mongoose.Schema({
    userId:{
        type: ObjectId,
        // required: true,
        ref:"UserRegistration",
    },
    text:{
        type: String,
        // required: true
    },
    // imageVideo: {
    //    type: String,
    //    required: true 
    //   },
    postStatus:{
        type: String,
        enum:["Public", "Private"],
        default: "Public"
    },
    hashtagText:{
        type:String
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
    isDeleted:{
        type: Boolean,   
        default: false
    },
    deletedAt: { 
      type: Date,
      default: null }
},{timestamps:true})
module.exports = mongoose.model('UserPost', userPostSchema)