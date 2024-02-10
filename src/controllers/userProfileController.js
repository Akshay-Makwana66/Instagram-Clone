const userModel = require('../models/registrationModel');

const userPostModel =require("../models/userPostModel")
const profileDetails = async(req,res)=>{
    try{
        
        let getProfile = await userModel.findOne({_id:req.userId}).select({_id:0,name:1,emailId:1,userName:1,gender:1,mobile:1,profile:1,followerCount:1,followedBy:1,followingCount:1,following:1,blockedUser:1})
        if(!getProfile) return res.status(404).send({status:false,message:"userId not found"})
        else return res.status(200).send({status:true,message:"your profile",data:getProfile})
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

const followerCount = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find and update the post in a single operation
        const unfollow = await userModel.findOneAndUpdate(
            { _id: userId, followedBy:req.userId }, // Check if user has already liked
            {
                $inc: { followerCount: -1 ,followingCount:-1,}, // Decrease by 1 when unliking
                $pull: { followedBy:req.userId,following:userId } // Remove userId from likesBy array
            },
            { 
                new: true, // Return the updated document
                // returnDocument: 'after' // Ensure the updated document is returned
            }
            );
            
            if (!unfollow) {
                // If countLikes is null, it means the user hasn't liked the post before
                const follow = await userModel.findOneAndUpdate(
                    { _id: userId },
                    {
                        $inc: { followerCount: 1 }, // Increase by 1 when liking
                        $addToSet: { followedBy: req.userId } // Add userId to likesBy array
                    },
                { 
                    new: true, // Return the updated document
                    // returnDocument: 'after' // Ensure the updated document is returned
                }  
               
            );
            if(follow){
                const following = await userModel.findOneAndUpdate(
                    { _id: req.userId },
                    {
                        $inc: { followingCount: 1 }, // Increase by 1 when liking
                        $addToSet: { following: userId } // Add userId to likesBy array
                    },
                { 
                    new: true, // Return the updated document
                    // returnDocument: 'after' // Ensure the updated document is returned
                }               
            );
            }
            
            return res.status(200).send({ status: true, message: "follow user", data: follow });
        }
        console.log(unfollow);
        return res.status(200).send({ status: true, message: "unfollow user", data: unfollow });

    } catch (err) {
        return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
    }
};

const editProfile= async (req,res)=>{
            try{
                let data = req.body;
                let updateProfile = await userModel.findOneAndUpdate({_id:req.userId},data,{new:true});
                if(!updateProfile) {
                return res.status(404).send({status:false,message:"User not found"})
                }
                return res.status(201).send({status:false,data:updateProfile});
            }catch(err){
             return res.status(500).send({status:false,message:err.message})
            }
}
const postCount = async(req,res)=>{
    try{
        
        let getPostCount = await userPostModel.find({userId:req.userId}).countDocuments();
        if(!getPostCount){
            return res.status(404).send({status:false,message:"you have no post"})
        } 
            return res.status(200).send({status:true,message:"your postCount",data:getPostCount})
         
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

const blockedUser = async(req,res)=>{
    try{
        let userId = req.params.userId;
        let checkUserId = await userModel.findOne({_id:userId});
        if(!checkUserId){
            return res.status(404).send({status:false,message:"user not found"})
        }else{
            let unblocked = await userModel.findOneAndUpdate({_id:req.userId,blockedUser:userId},{
                $pull:{blockedUser:userId}},{new:true}  )
                if(!unblocked){
                    let blocked= await userModel.findOneAndUpdate({_id:req.userId},{ $addToSet:{blockedUser:userId}},{new:true})
                    return res.status(200).send({status:true,message:"user unblocked",data:blocked})
                }
                return res.status(200).send({status:true,message:"user unblocked",data:unblocked})
            }

    }catch(err){
        return res.status(500).send({status:false,message:err.message});
    }
}
module.exports= {profileDetails,followerCount,postCount,editProfile,blockedUser};