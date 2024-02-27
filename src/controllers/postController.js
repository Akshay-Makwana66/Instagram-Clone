const mongoose = require("mongoose");
const postModel = require("../models/userPostModel");
const userModel = require("../models/registrationModel");
const storyModel = require("../models/storyModel");

const userPost = async (req, res) => {
    try {
        let data = req.body;      

            // Store images and videos as separate strings in the images/videos array------------
            let images = req.files['images'] ? req.files['images'].map(file => file.filename.replace('uploads\\', '')) : [];
            let videos = req.files['videos'] ? req.files['videos'].map(file => file.filename.replace('uploads\\', '')) : [];

            data.images = images;
            data.videos = videos;      

            let savedData = await postModel.create(data);
            return res.status(201).send({ status: true, message: "Data created", Data: savedData });       

    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }
};

const userGetPost = async (req, res) => {
    try {
        let userAllPost = await postModel.find({ userId:req.userId,isDeleted: false}).populate({path:"userId",select:'name'})
    
        // Sort posts based on postTime in descending order to get the latest
        userAllPost.sort((a, b) => b.postTime - a.postTime);
  
        if (userAllPost.length > 0) {
            return res.status(200).send({ status: true, message: "Your posts", data: userAllPost });  
        }
        return res.status(404).send({ status: false, message: "You have no posts."});

    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
    }
};

const suggestions = async (req, res) => {
    try {
        let suggestionsUserProfile = await userModel.aggregate([
            { $sample: { size: 2 } },
            { $project: { name: 1, userName: 1 } } // Projection to include only 'name' and 'userName'
        ]);
        
        if (suggestionsUserProfile.length === 0) {
            return res.status(404).send({ status: false, message: "No user profile for suggestions" });
        }
        
        return res.status(200).send({ status: true, message: "Suggestions", suggestions: suggestionsUserProfile });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

// const suggestedUserIds = [];

// const suggestions = async (req, res) => {
//     try {
//         const totalNumberOfUsers = await userModel.countDocuments(); // Get the total number of users
        
//         let suggestionsUserProfile = await userModel.aggregate([
//             { $match: { _id: { $nin: suggestedUserIds } } }, // Exclude previously suggested users
//             { $sample: { size: 2 } },
//             { $project: { name: 1, userName: 1 } } // Projection to include only 'name' and 'userName'
//         ]);
        
//         if (suggestionsUserProfile.length === 0) {
//             return res.status(404).send({ status: false, message: "No user profile for suggestions" });
//         }
        
//         suggestedUserIds.push(suggestionsUserProfile[0]._id); // Add the suggested user's ID to the list
        
//         // If all users have been suggested, reset the list to suggest from the beginning
//         if (suggestedUserIds.length === totalNumberOfUsers) {
//             suggestedUserIds = [];
//         }
        
//         return res.status(200).send({ status: true, message: "Suggestions", suggestions: suggestionsUserProfile });
//     } catch (err) {
//         return res.status(500).send({ status: false, message: err.message });
//     }
// };
 
const getAllPost = async (req, res) => { 
    try {
        let userAllPost = await postModel.find({ isDeleted: false }).populate({path:"userId",select:'name blockedUser'})
        // Filter out posts by blocked users
        userAllPost = userAllPost.filter(post => !post.userId.blockedUser.some(id => id.equals(req.userId)));
        userAllPost=userAllPost.filter(post=>post.postStatus==="Public")
        // Sort posts based on postTime in descending order to get the latest----
        userAllPost.sort((a, b) => b.postTime - a.postTime);

        if (userAllPost.length > 0) {
            return res.status(200).send({ status: true, message: "Your posts", data: userAllPost });  
        }
        return res.status(404).send({ status: false, message: "You have no posts."});

    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
    }
};


const randomPost = async (req,res)=>{
    try {
        let userAllPost = await postModel.aggregate([ { $sample: { size: 3 } } ]) 
         // Sort posts based on postTime in descending order
         userAllPost.sort((a, b) => b.postTime - a.postTime);
        userAllPost=userAllPost.filter(post=>post.postStatus==="Public")
        if (userAllPost.length > 0) {
            return res.status(200).send({ status: true, message: "Your posts", data: userAllPost });  
        }
        return res.status(404).send({ status: false, message: "you have no post"});

    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }
};

const postCount = async(req,res)=>{
    try{
        
        let getPostCount = await userPostModel.find({userId:req.userId,isLogout:false}).countDocuments();
        if(!getPostCount){
            return res.status(404).send({status:false,message:"you have no post"})
        } 
            return res.status(200).send({status:true,message:"your postCount",data:getPostCount})
         
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
};

const editPost = async (req,res)=>{
    try{
        let postId = req.params.postId;
        let data = req.body;
        if(!mongoose.isValidObjectId(postId)) return res.status(404).send({status: false,message: "write valid postId"})

        let editPost = await postModel.findOneAndUpdate({_id:postId,userId:req.userId},data,{new:true});
        if(!editPost) {
        return res.status(404).send({status:false,message:"you are not authorized to edit this post"})
        }
        return res.status(201).send({status:false,data:editPost});
    }catch(err){
     return res.status(500).send({status:false,message:err.message})
    }
};

const likesPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        if(!mongoose.isValidObjectId(postId)) return res.status(404).send({status: false,message: "write valid postId"})
        let checkPostId = await postModel.findOne({ _id: postId })
        if (!checkPostId){
            return res.status(404).send({ status: false, message: "postId not found" });
        }
        // Find and update the post in a single operation
        const countLikes = await postModel.findOneAndUpdate(
            { _id: postId, likesBy: req.userId }, // Check if user has already liked
            {
                $inc: { likes: -1 }, // Decrease by 1 when unliking
                $pull: { likesBy: req.userId } // Remove userId from likesBy array
            },
            { 
                new: true, 
            }
            ).populate({ path: 'likesBy', select: 'name userName' }).populate({ path: 'userId', select: 'name userName' });
            
            if (!countLikes) {
                // If countLikes is null, it means the user hasn't liked the post before
                const likedPost = await postModel.findOneAndUpdate(
                    { _id: postId },
                    {
                        $inc: { likes: 1 }, // Increase by 1 when liking
                        $addToSet: { likesBy: req.userId } // Add userId to likesBy array
                    },
                    { 
                        new: true, 
                        
                    }
                    ).populate({ path: 'likesBy', select: 'name userName' }).populate({ path: 'userId', select: 'name userName' });
                    
                    return res.status(200).send({ status: true, message: "post liked", data: likedPost });
                }
                return res.status(200).send({ status: true, message: "post unliked", data: countLikes });
                
            } catch (err) {
                return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
            }
};


const getListOfUsersLikedPost = async (req,res)=>{
    try {
        let postId = req.params.postId;
        if(!mongoose.isValidObjectId(postId)) return res.status(404).send({status: false,message: "write valid postId"})
        let checkPostId= await postModel.findOne({_id:postId}).select({likesBy:1,likes:1,_id:0}).populate({ path: 'likesBy', select: 'name userName' })
        if(!checkPostId){
            return  res.status(404).send({ status: false, message: "postid not found"});
        }else{
            return res.status(200).send({status:true,message:"post likes users list",data:checkPostId})           
        }
    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }  
};

const deleteUserPost = async (req,res)=>{
            try{
               let postId = req.params.postId;
               if(!mongoose.isValidObjectId(postId)) return res.status(400).send({status:false,message:"write valid postId"})
               let checkId = await postModel.findOneAndUpdate({_id:postId,userId:req.userId,isDeleted:false},{$set:{isDeleted:true,deletedAt:new Date()}},{new:true}).exec()
                if(checkId){
                return res.status(200).send({ status: true, message: "post deleted"});
                } 
                return res.status(404).send({ status: false, message: "you are not authorized to delete this post" });
                }catch(err){
                return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
                }
};

module.exports={userPost,userGetPost,suggestions,getAllPost,postCount,editPost,randomPost,likesPost,getListOfUsersLikedPost,deleteUserPost};