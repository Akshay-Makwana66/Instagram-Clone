const userModel = require("../models/registrationModel");
const mongoose = require("mongoose");
const userPostModel = require("../models/userPostModel");

// const sharedPost = async (req,res)=>{
//     try{
//         let userId = req.params.userId;
//         let postId = req.params.postId;

//         if(!mongoose.isValidObjectId(postId)) return res.status(400).send({status:false,message:"write valid  ObjectId of postId"});
//         if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false,message:"write valid ObjectId of userId"})

//         let checkpostId = await userPostModel.findOne({_id:postId});
//     if(!checkpostId){
//         return res.status(404).send({status:false,message:"your postId not found"})
//     }
//     let sharedTo = await userModel.findOneAndUpdate({_id:userId},{$addToSet:{sharedBy:{user:req.userId,post:postId}}},{new:true}).populate({path:"sharedBy.user",selcet:'name'})

//     if(!sharedTo){
//         return res.status(404).send({status:false,message:"not found"})
//     }else{
//         let sharedBy = await userModel.findOneAndUpdate({_id:req.userId},{$addToSet:{sharedTo:{user:userId,post:postId}}},{new:true})
//     }
//     return res.status(201).send({status:true,sharedPost:sharedTo})
//     }catch(err){
//         return res.status(500).send({status:false,message:err.message});
//     }
// }

const sharedPost = async (req, res) => {
    try {
        let userId = req.params.userId;
        let postId = req.params.postId;

        if (!mongoose.isValidObjectId(postId)) return res.status(400).send({ status: false, message: "Please provide a valid ObjectId for postId" });
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please provide a valid ObjectId for userId" });

        let checkpostId = await userPostModel.findOne({ _id: postId });
        if (!checkpostId) {
            return res.status(404).send({ status: false, message: "The specified postId was not found" });
        }

        let [sharedTo, sharedBy] = await Promise.all([
            userModel.findOneAndUpdate({ _id: userId }, { $addToSet: { sharedBy: { user: req.userId, post: postId } } }, { new: true })
            .populate({ path: "sharedBy.user", select: 'name' }).populate({ path: "sharedTo.user", select: 'name' }),
            userModel.findOneAndUpdate({ _id: req.userId }, { $addToSet: { sharedTo: { user: userId, post: postId } } }, { new: true })
            .populate({ path: "sharedBy.user", select: 'name' }).populate({ path: "sharedTo.user", select: 'name' })
        ]);    

        if (!sharedTo || !sharedBy) {
            return res.status(404).send({ status: false, message: "User or post not found" });
        }

        return res.status(201).send({ status: true, sharedPost: sharedTo });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const removeSharedPost = async (req, res) => {
    try {
        let postId = req.params.postId;

        // Remove the shared post from the sharedTo array of the current user
        let removesharedPost = await userModel.findOneAndUpdate(
            { _id: req.userId, "sharedTo.post": postId},
            { $pull: { "sharedTo": { post:postId} } },
            { new: true }
        );

        if (removesharedPost) {
            // Remove the shared post from the sharedBy array of all users who shared it
            let removePostFromSharedBy = await userModel.updateMany(
                { "sharedBy.post": postId, "sharedBy.user": req.userId },
                { $pull: { "sharedBy": {  post:postId} } }
            );

            return res.status(200).send({ status: true, message: "sharedPost Deleted" });
        }
        return res.status(404).send({ status: false, message: "not found" });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = {sharedPost,removeSharedPost}