require("dotenv").config()
const userModel = require('../models/registrationModel');
const userPostModel =require("../models/userPostModel");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
const profileDetails = async(req,res)=>{
    try{        
        let getProfile = await userModel.findOne({_id:req.userId,isDeleted:false}).select({_id:0,name:1,emailId:1,userName:1,gender:1,mobile:1,profile:1,followerCount:1,followedBy:1,followingCount:1,following:1,blockedUser:1,profileStatus:1,isLogout:1,isDeactivated:1,deactivationEndDate:1}).populate({path:"followedBy",select:'name'}).populate({path:"followedTo",select:'name'})
        if(!getProfile) return res.status(404).send({status:false,message:"user not found"})
        if(getProfile.isLogout!==false) return res.status(404).send({status:false,message:"you are not loggedIn"});
        if(getProfile.isDeactivated) return res.status(404).send({status:false,message:`your account is deActivated and activate on ${getProfile.deactivationEndDate}`})
        else return res.status(200).send({status:true,message:"your profile",data:getProfile})
    }catch(err){
        return res.status(500).send({status:false,message:err.message});
    }
};

const searching = async (req, res) => {
    try {
        let findName = req.params.name;
        let searchingByName = await userModel.find({ name: { $regex: findName, $options: 'i' } })
            .select({ name: 1, userName: 1 });

        if (searchingByName.length === 0) {
            return res.status(404).send({ status: false, message: "No user profile found with this name" });
        }
        
        return res.status(200).send({ status: true, message: "Searched name list", searchingName: searchingByName });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const otherUserProfileDetails = async (req, res) => {
    try {
        let userId = req.params.userId;
        if (!mongoose.isValidObjectId(userId)) return res.status(404).send({ status: false, message: "write valid userId" });
        
        let getProfile = await userModel.findOne({ _id: userId, isDeleted: false, isDeactivated: false })
            .populate({
                path: 'followedBy',
                select: 'name' // Include the 'name' field to populate
            });

        if (!getProfile) {
            return res.status(404).send({ status: false, message: "User not found" });
        }

        // Check if req.userId is in the blocked users array
        if (getProfile.blockedUser.some(id => id.equals(req.userId))) {
            return res.status(403).send({ status: false, message: "You are blocked by this user. You cannot see this profile." });
        }

        let responseData;

        if (getProfile.profileStatus === "Private") {
            responseData = {
                name: getProfile.name,
                userName: getProfile.userName,
                followerCount: getProfile.followerCount,
                followingCount: getProfile.followingCount,
                profileStatus: getProfile.profileStatus
            };
        } else {
            responseData = {
                profileImage: getProfile.profileImage,
                name: getProfile.name,
                userName: getProfile.userName,
                profileStatus: getProfile.profileStatus,
                followerCount: getProfile.followerCount,
                followedBy: getProfile.followedBy.map(user => ({ _id: user._id, name: user.name })),
                followingCount: getProfile.followingCount,
                followingTo: getProfile.followingTo
            };
        }

        return res.status(200).send({ status: true, message: "User profile", data: responseData });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};



const editProfile = async (req, res) => {
    try {
        let data = req.body;
        const { password } = data;
        if (password) {
            data.password = await bcrypt.hash(password, saltRounds);
        }

        let updateProfile = await userModel.findOneAndUpdate({ _id: req.userId,isLogout:false,isDeactivated:false,isDeleted:false },  { $set: { ...data, email_verified: false } }, { new: true });

        if (!updateProfile) {
            return res.status(404).send({ status: false, message: "User not found" });
        }

        if (updateProfile.emailId) {
            const transporter = nodemailer.createTransport({
                service: process.env.SERVICE,
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS
                }
            });   
            var mailOptions = {
                from: process.env.USER,
                to: updateProfile.emailId,
                subject: 'verify your mail',
                html: '<p>Hello '+updateProfile.name+', please click here to <a href="http://localhost:4000/verify?id='+updateProfile._id +'" style="background-color: #007fff; display: inline-block; padding: 2px; color: white; text-decoration: none;"><span style="font-size: 15px;">verify</span></a> your emailId.</p>'
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Error sending email:", err); // Log any errors
                    return res.status(500).send({ status: false, message: "Error sending verification email" });
                } else {
                    console.log("Verification email sent:", info.response);
                }
            });
        }

        res.status(201).send({ status: true, data: updateProfile, message: `${updateProfile.name} verify your emailId` });
    } catch (err) {
        console.error("Error in editProfile:", err);
        return res.status(500).send({ status: false, message: err.message });
    }
};

const followerCount = async (req, res) => {
    try {
        const userId = req.params.userId;
        if(!mongoose.isValidObjectId(userId)) return res.status(404).send({status: false,message: "write valid userId"})
        let checkUserId= await userModel.findOne({_id:userId,isDeactivated:false,isDeleted:false})
        if(!checkUserId) return res.status(404).send({status:false,message:"user not found"})
        // Find and update the user being unfollowed
        const unfollow = await userModel.findOneAndUpdate(
            { _id: userId, followedBy: req.userId }, // Check if user is being followed by the current user
            {
                $inc: { followerCount: -1 }, // Decrease followerCount by 1
                $pull: { followedBy: req.userId } // Remove userId from followedBy array
            },
            { new: true }
        )
        if(unfollow){
            const updateUser = await userModel.findOneAndUpdate(
                { _id: req.userId, followingTo: userId }, // Check if the current user is following the user being unfollowed
                {
                    $inc: { followingCount: -1 }, // Decrease followingCount by 1
                    $pull: { followingTo: userId } // Remove userId from followingTo array
                },
                { new: true }
            );
        }
       
        // If the user is not already following, then follow
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
                        ).populate({path:'followedBy',select:'name'})
                        if(follow){
                            const following = await userModel.findOneAndUpdate(
                                { _id: req.userId },
                                {
                                    $inc: { followingCount: 1 }, // Increase by 1 when liking
                                    $addToSet: { followingTo: userId } // Add userId to likesBy array
                                },
                            { 
                                new: true, // Return the updated document
                                // returnDocument: 'after' // Ensure the updated document is returned
                            }               
                        )                     
                        
                        }
                        
                        return res.status(200).send({ status: true, message: "follow user", data: follow });
                    }
                    return res.status(200).send({ status: true, message: "unfollow user", data: unfollow });
            
    } catch (err) {
        return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, error: err.message });
    }
};

const getFollower = async(req,res)=>{
    try{        
        let getFollower = await userModel.findOne({_id:req.userId,isLogout:false,isDeactivated:false}).select({followerCount:1,followedBy:1}).populate({path:"_id",select:'name'}).populate({path:'followedBy',select:'name'})
        if(getFollower.followerCount==0){
            return res.status(404).send({status:false,message:"you have no follower"})
        } 
        //  Extracting name from _id and populating it
        getFollower = await userModel.populate(getFollower, {
            path: '_id',
            select: 'name'
        });
        return res.status(200).send({status:true,message:"your follower",data:getFollower})
         
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
};

const getFollowing = async(req,res)=>{
    try{        
        let getFollowing = await userModel.findOne({_id: req.userId,isLogout:false,isDeactivated:false}).select({followingCount: 1, followingTo: 1}).populate({path: 'followingTo', select: 'name'});
        
        if (getFollowing.followingCount === 0) {
            return res.status(404).send({status: false, message: "You did not follow anyone yet"});
        } 
         //  Extracting name from _id and populating it
         getFollowing = await userModel.populate(getFollowing, {
            path: '_id',
            select: 'name'
        });
        return res.status(200).send({status: true, message: "Your following", data: getFollowing});
    } catch (err) {
        console.log(err);
        return res.status(500).send({status: false, message: err.message});
    }
};

const blockedUser = async(req,res)=>{
    try{
        let userId = req.params.userId;
        let checkUserId = await userModel.findOne({_id:userId,isDeactivated:false,isDeleted:false});
        if(!checkUserId){
            return res.status(404).send({status:false,message:"user not found"})
        }else{
            let unblocked = await userModel.findOneAndUpdate({_id:req.userId,blockedUser:userId},{
                $pull:{blockedUser:userId},$inc:{blockedUserCount:-1}},{new:true}  ).populate({path:'followedBy',select:'name'})
                if(!unblocked){
                    let blocked= await userModel.findOneAndUpdate({_id:req.userId},{ $addToSet:{blockedUser:userId},$inc:{blockedUserCount:1}},{new:true}).populate({path:'blockedUser',select:'name'}).populate({path:'followedBy',select:'name'})
                    return res.status(200).send({status:true,message:"user unblocked",data:blocked})
                }
                return res.status(200).send({status:true,message:"user unblocked",data:unblocked})
            }

    }catch(err){
        return res.status(500).send({status:false,message:err.message});
    }
};

const logout = async(req,res)=>{
            try{
                let checkUserId = await userModel.findOneAndUpdate({_id:req.userId},{$set:{isLogout:true}},{new :true})
                if(!checkUserId) return res.status(404).send({status:false,message:"user not found"})
               
                res.status(200).send({ status:false,message: 'Logged out successfully' });
            }catch(err){
               return res.status(500).send({status:false,message:err.message});
            }
};                                                                                                                      

const deactivateAccount = async (req, res) => {
    try {
        const { duration } = req.body; // Duration in days (e.g., 10, 30, 365)
        
        if (![10, 30, 365].includes(duration)) { // Ensure only allowed durations are accepted
            return res.status(400).send({ status: false, message: "You can only deactivate your account for 10, 30, or 365 days." });
        }

        // Calculate deactivation end date based on the selected duration
        const deactivationEndDate = new Date();
        deactivationEndDate.setDate(deactivationEndDate.getDate() + duration);

        // Update user document with deactivation details
        const updatedUser = await userModel.findOneAndUpdate(
            { _id: req.userId },
            { $set: { isDeactivated: true, deactivationEndDate } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({ status: false, message: "User not found." });
        }

        // Format deactivationEndDate to return only the date part
        const formattedDate = deactivationEndDate.toISOString().split('T')[0];

        return res.status(200).send({ status: true, message: "Your account has been deactivated temporarily.", deactivationEndDate: formattedDate });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const activateAccount = async (req, res) => {
    try {
        // Update user document to activate the account
        const updatedUser = await userModel.findOneAndUpdate(
            { _id: req.userId, isDeactivated: true },
            { $set: { isDeactivated: false, deactivationEndDate: null } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({ status: false, message: "User not found or account is not deactivated." });
        }

        return res.status(200).send({ status: true, message: "Your account has been reactivated." });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const deleteAccount = async(req,res)=>{
    try{
        let checkUserId = await userModel.findOneAndUpdate({_id:req.userId,isLogout:false,isDeleted:false},{$set:{isLogout:true,isDeleted:true,deletedAt:new Date()}},{new :true})
        if(!checkUserId) return res.status(404).send({status:false,message:"user not found"})
       
        res.status(200).send({ status:false,message: 'Your Account Deleted Permanently'});
    }catch(err){
       return res.status(500).send({status:false,message:err.message});
    }
}
module.exports= {profileDetails,searching,otherUserProfileDetails,followerCount,getFollower,getFollowing,editProfile,blockedUser,logout,deactivateAccount,activateAccount,deleteAccount};