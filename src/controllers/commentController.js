const postModel = require("../models/userPostModel")
const createCommentOnPost = async (req, res) => {
    try {
        let postId = req.params.postId;
        let { text } = req.body.comments; 

        let checkPostId = await postModel.findOne({ _id: postId })
        if (!checkPostId){
            return res.status(404).send({ status: false, message: "postId not found" });
        } 
        // // Check if req.userId is in the blocked users array
        // if (checkPostId.userId.blockedUser.some(id => id.equals(req.userId))) {
        //     return res.status(403).send({ status: false, message: "You are blocked by this user. You cannot comment on this post." });
        // }

        let newComment = {
            user: req.userId,
            text: text 
        };  
        
        let savedData = await postModel.findByIdAndUpdate(postId, { $push: { comments: newComment },$inc:{commentCount:1} }, { new: true })
        .populate({path:"comments.user",select:'name userName'}).populate({path:"userId",select:"name userName"}).populate({path:'likesBy',select:'name'})
        
        if (!savedData){
            return res.status(500).send({ status: false, message: "Failed to save comment" });
        }
        
        return res.status(201).send({ status: true, message: "Comment added successfully", data: savedData });

    } catch (err) {
        res.status(500).send({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });
    }
};

const viewCommentOnPost = async(req,res)=>{
                try{
                    let postId = req.params.postId;
                    let getPostComment = await postModel.findOne({_id:postId}).select({comments:1,_id:0})
                    .populate({path:"comments.user",select:'name userName'});
                   
                    if(!getPostComment){
                    return res.status(200).send({status:false,message:"postId is not correct"})
                    }
                    // // Check if req.userId is in the blocked users array
                    // if (getPostComment.userId.blockedUser.some(id => id.equals(req.userId))) {
                    //     return res.status(403).send({ status: false, message: "You are blocked by this user. So, You cannot see the comment of this post." });
                    // }
                    return res.status(200).send({status:false,comments:getPostComment})
                }catch(err){
                return res.status(500).send({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });       
                }
};                                                                                                                                 

const updateCommentOnPost = async (req, res) => {
    try {
        let postId = req.params.postId;
        let commentId = req.params.commentId;
        let { text } = req.body.comments;

        let updateComment = await postModel.findOneAndUpdate(
            { _id: postId, "comments._id": commentId, "comments.user": req.userId },
            { $set: { "comments.$[inner].text": text } },
            {arrayFilters: [
                { "inner._id": commentId },
            ], new: true }
        ).populate({path:"comments.user",select:'name'}).populate({path:'likesBy',select:'name'})

        if (!updateComment) {
            return res.status(404).send({ status: false, message: "Failed to update comment" });
        }

        return res.status(200).send({ status: true, message: "Comment updated successfully", data: updateComment });

    } catch (err) {
        res.status(500).send({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });
    }
};


const deleteCommentOnPost = async (req, res) => {
    try {
        let postId = req.params.postId;
        let commentId = req.params.commentId;

        let deleteCommentsPost = await postModel.findOneAndUpdate(
            { _id: postId ,"comments._id":commentId,"comments.user":req.userId},
            { $pull: { comments: { _id: commentId, user: req.userId } },$inc:{commentCount:-1} }
        );

        if (!deleteCommentsPost) {
            return res.status(404).send({ status: false, message: "postId or commentId is not correct or you are not authorised to delete this comment" });
        }

        return res.status(200).send({ status: true, message: "Comment deleted" });
    } catch (err) {
        res.status(500).send({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });
    }
};

const commentCount = async (req, res) => {
    try {        
        let postId = req.params.postId;
        let getCommentCount = await postModel.findOne({ _id: postId }).select({ commentCount: 1 });
               
        if (!getCommentCount) {
         return res.status(404).send({ status: false, message: "Post not found" });
        }
                
        return res.status(200).send({ status: true, message: "Your comment count", comment: getCommentCount.commentCount });
                 
        } catch(err) {
            return res.status(500).send({ status: false, message: err.message });
        }
};

const createSubCommentsOnPost = async (req,res)=>{
    try {
       let postId = req.params.postId;
       let commentId = req.params.commentId;
       let data = req.body;
       let replyOnComment = await postModel.findOneAndUpdate({_id:postId,"comments._id":commentId},
       {$push:{"comments.$.subComments":{user:req.userId,text:data.comments.text}}},
       {new:true}).populate({path:"comments.user",select:'name'})
       .populate({path:"userId",select:"name"})
       .populate({path:"comments.subComments.user",select:'name'}).populate({path:'likesBy',select:'name'})
        if(!replyOnComment){
            return res.status(404).send({status:false,message:"you are not authrorized or invalid postId or commentId"})
        }
       return res.status(201).send({ status: true, message: "reply send", Data: replyOnComment });       

    } catch (err) {
        console.log(err);
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }
};

const updateSubCommentOnPost = async (req, res) => {
    try {
        let postId = req.params.postId;
        let subcommentId = req.params.subcommentId;
        let { text } = req.body.comments;

        // Update the subcomment text and updatedAt field in the post document
        let updateSubComment = await postModel.findOneAndUpdate(
            { 
                _id: postId, 
                "comments.subComments._id": subcommentId, 
                "comments.subComments.user": req.userId 
            },
            { 
                $set: { 
                    "comments.$[].subComments.$[inner].text": text,
                } 
            }, 
            { 
                arrayFilters: [
                    { "inner._id": subcommentId },
                ],
                new: true 
            } 
        ).populate({path:"comments.user",select:'name'})
        .populate({path:"userId",select:"name"})
        .populate({path:"comments.subComments.user",select:'name'})
        .populate({path:'likesBy',select:'name'})

        // If the update operation failed, return an error response
        if (!updateSubComment) {
            return res.status(404).send({ status: false, message: "Failed to update comment" });
        }

        // If the update is successful, return a success response
        return res.status(200).send({ status: true, message: "Comment updated successfully", data: updateSubComment });

    } catch (err) {
        // If an error occurs during the process, log it and send an error response
        console.log(err);
        res.status(500).send({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });
    }
};




const deleteSubCommentOnPost = async (req, res) => {
    try {
        let postId = req.params.postId;
        let subcommentId = req.params.subcommentId;

        // Update the post document to remove the specified subcomment
        let deleteCommentsPost = await postModel.findOneAndUpdate(
            // Match the post by its ID and the subcomment by its ID and the user who created it
            { 
                _id: postId,
                "comments.subComments._id": subcommentId,
                "comments.subComments.user": req.userId
            },
            // Pull the specified subcomment from the subComments array of the matched comment
            { 
                $pull: { 
                    "comments.$.subComments": { 
                        _id: subcommentId 
                    } 
                } 
            },
            { new: true } // Return the modified document after update
        );

        // If the post or subcomment was not found, return an error response
        if (!deleteCommentsPost) {
            return res.status(404).send({ status: false, message: "postId or subcommentId is not correct or you are not authorized to delete this subcomment" });
        }

        // If deletion is successful, send a success response
        return res.status(200).send({ status: true, message: "Sub-comment deleted" });
    } catch (err) {
        // If an error occurs during the process, send an error response
        res.status(500).send({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });
    }
};

module.exports={createCommentOnPost,viewCommentOnPost,updateCommentOnPost,deleteCommentOnPost,commentCount,createSubCommentsOnPost,updateSubCommentOnPost,deleteSubCommentOnPost};
