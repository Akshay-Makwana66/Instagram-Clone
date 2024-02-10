const { default: mongoose } = require("mongoose");
const postModel = require("../models/userPostModel");

const userPost = async (req, res) => {
    try {
        let data = req.body;
        data.userId=req.userId
       
    let savedData = await postModel.create(data);
    return res.status(201).send({ status: true, message: "Data created", Data: savedData });       

    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }
};

const getPost = async (req,res)=>{
    try {
        let userAllPost = await postModel.find({isDeleted:false});      
        if (userAllPost.length > 0) {
            return res.status(200).send({ status: true, message: "Your posts", data: userAllPost });  
        }
        return res.status(404).send({ status: false, message: "you have no post"});

    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }
}
const randomPost = async (req,res)=>{
    try {
        let userAllPost = await postModel.aggregate([ { $sample: { size: 3 } } ])      
        if (userAllPost.length > 0) {
            return res.status(200).send({ status: true, message: "Your posts", data: userAllPost });  
        }
        return res.status(404).send({ status: false, message: "you have no post"});

    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }
}

const getListOfUsersLikedPost = async (req,res)=>{
    try {
        let postId = req.params.postId;
        let checkPostId= await postModel.findOne({_id:postId,userId:req.userId}).select({likesBy:1,likes:1,_id:0})
        if(!checkPostId){
            return  res.status(404).send({ status: false, message: "your postid not found or you are not authorized"});
        }else{
            return res.status(200).send({status:true,message:"post likes users",data:checkPostId})           
        }
    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }
}



const editPost = async (req,res)=>{
    try{
        let postId = req.params.postId;
        let data = req.body;
        let editPost = await postModel.findOneAndUpdate({_id:postId,userId:req.userId},data,{new:true});
        if(!editPost) {
        return res.status(404).send({status:false,message:"you are not authorized to edit this post"})
        }
        return res.status(201).send({status:false,data:editPost});
    }catch(err){
     return res.status(500).send({status:false,message:err.message})
    }
}



const likesPost = async (req, res) => {
    try {
        const postId = req.params.postId;

        // Find and update the post in a single operation
        const countLikes = await postModel.findOneAndUpdate(
            { _id: postId, likesBy: req.userId }, // Check if user has already liked
            {
                $inc: { likes: -1 }, // Decrease by 1 when unliking
                $pull: { likesBy: req.userId } // Remove userId from likesBy array
            },
            { 
                new: true, // Return the updated document
                // returnDocument: 'after' // Ensure the updated document is returned
            }
        );

        if (!countLikes) {
            // If countLikes is null, it means the user hasn't liked the post before
            const likedPost = await postModel.findOneAndUpdate(
                { _id: postId },
                {
                    $inc: { likes: 1 }, // Increase by 1 when liking
                    $addToSet: { likesBy: req.userId } // Add userId to likesBy array
                },
                { 
                    new: true, // Return the updated document
                    // returnDocument: 'after' // Ensure the updated document is returned
                }
            );

            return res.status(200).send({ status: true, message: "post liked", data: likedPost });
        }
        return res.status(200).send({ status: true, message: "post unliked", data: countLikes });

    } catch (err) {
        return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
    }
};

const deleteUserPost = async (req,res)=>{
                try{
                    let postId = req.params.postId;
                    if(!mongoose.isValidObjectId(postId)) return res.status(400).send({status:false,message:"write valid ObjectId"})
                    let checkId = await postModel.findOneAndUpdate({_id:postId,userId:req.userId,isDeleted:false},{$set:{isDeleted:true,deletedAt:new Date()}},{new:true}).exec()
                    if(checkId){
                        return res.status(200).send({ status: true, message: "post deleted"});
                    } 
                    return res.status(404).send({ status: false, message: "postId not found" });
               }catch(err){
                return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
               }
}


const createCommentOnPost = async (req, res) => {
    try {
        let postId = req.params.postId;
        let { text } = req.body.comments; // Extract 'text' from the 'comments' object in the request body
        let checkPostId = await postModel.findOne({ _id: postId });
        
        if (!checkPostId) 
            return res.status(404).send({ status: false, message: "postId not found" });

        let newComment = {
            user: req.userId,
            text: text // Use the extracted 'text'
        };
        
        let savedData = await postModel.findByIdAndUpdate(postId, { $push: { comments: newComment } }, { new: true });
        
        if (!savedData)
            return res.status(500).send({ status: false, message: "Failed to save comment" });
        
        return res.status(201).send({ status: true, message: "Comment added successfully", data: savedData });

    } catch (err) {
        res.status(500).send({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });
    }
};

const viewCommentOnPost = async(req,res)=>{
                try{
                    let postId = req.params.postId;
                    let getPostComment = await postModel.findOne({_id:postId}).select({comments:1,_id:0})
                    if(!getPostComment){
                        return res.status(200).send({status:false,message:"postId is not correct"})
                    }
                    return res.status(200).send({status:false,comments:getPostComment})
                }catch(err){
                return res.status(500).send({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });       
                }
}

const deleteCommentOnPost = async (req, res) => {
    try {
        let postId = req.params.postId;
        let commentId = req.params.commentId;

        let deleteCommentsPost = await postModel.findOneAndUpdate(
            { _id: postId },
            { $pull: { comments: { _id: commentId, user: req.userId } } }
        );

        if (!deleteCommentsPost) {
            return res.status(404).send({ status: false, message: "postId or commentId is not correct" });
        }

        return res.status(200).send({ status: true, message: "Comment deleted" });
    } catch (err) {
        res.status(500).send({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });
    }
};




const subCommentsOnPost = async (req,res)=>{
    try {
        let userAllPost = await postModel.find();      
   
    return res.status(201).send({ status: true, message: "Data created", Data: userAllPost });       

    } catch (err) {
        res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }
}

module.exports={userPost,getPost,editPost,randomPost,likesPost,getListOfUsersLikedPost,deleteUserPost,createCommentOnPost,viewCommentOnPost,deleteCommentOnPost,subCommentsOnPost};