const express = require("express");
const router = express.Router();
const multer  = require('multer');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // Uploads will be stored in the "uploads" directory
    },
    filename: function (req, file, cb) {
        // Remove the "uploads/" prefix from the filename
        const uniquePrefix = Date.now() + '-';
        cb(null, uniquePrefix + file.originalname);
    }
});

const upload = multer({ storage: storage });

// All imports files-----------
const {userRegistration,verifyEmail,userLogin, forgetPassword}= require("../controllers/userController");
const {userPost,userGetPost,suggestions,getAllPost,randomPost,postCount,editPost,deleteUserPost,getListOfUsersLikedPost,likesPost}= require("../controllers/postController");
const {createCommentOnPost,viewCommentOnPost,updateCommentOnPost,deleteCommentOnPost,commentCount,createSubCommentsOnPost,updateSubCommentOnPost,deleteSubCommentOnPost}=require("../controllers/commentController.js");
const {profileDetails,searching,otherUserProfileDetails,editProfile,followerCount,getFollower,getFollowing,blockedUser,logout, deleteAccount, deactivateAccount, activateAccount}= require("../controllers/userProfileController");
const  {Authentication} = require("../middleware/auth");
const { registrationValidations,profileUpdateValidations } = require("../middleware/registrationValidations.js");
const { postValidations, commentValidations } = require("../middleware/postValidations.js");
const {sharedPost,removeSharedPost} = require("../controllers/sharedPost.js");
const {postStories, viewStories,viewer,deleteStories} = require("../controllers/postStoriesController.js");

//User  Api's----------------4
router.post("/registration",upload.fields([{ name: 'profileImage', maxCount: 5 }]),registrationValidations,userRegistration);
router.get("/verify",verifyEmail);  
router.post("/login",userLogin);  
router.patch("/forget-password",forgetPassword);  

// User Profile Api's------------------14
router.get("/getProfile",Authentication,profileDetails);
router.get("/searching/:name",Authentication,searching);
router.patch("/editProfile",Authentication,profileUpdateValidations,editProfile);
router.get("/otherUserProfileDetails/:userId",Authentication,otherUserProfileDetails);
router.post("/userId/:userId/follow",Authentication,followerCount);
router.get("/getFollower",Authentication,getFollower);
router.get("/getFollowing",Authentication,getFollowing);
router.post("/user/:userId/block",Authentication,blockedUser);
router.post("/user/:userId/post/:postId",Authentication,sharedPost);
router.delete("/post/:postId/removeSharedPost",Authentication,removeSharedPost);
router.get("/logout",Authentication,logout);
router.get("/deactivateAccount",Authentication,deactivateAccount);
router.get("/activateAccount",Authentication,activateAccount);
router.delete("/deleteAccount",Authentication,deleteAccount);

//User  post api's--------------------9
router.post("/createPost",Authentication,upload.fields([{ name: 'images', maxCount: 6 }, { name: 'videos', maxCount: 6 }]),postValidations,userPost);
router.get("/userPost",Authentication,userGetPost)
router.get("/suggestions",Authentication,suggestions);
router.get("/getAllPost",Authentication,getAllPost); 
router.get("/randomPost",Authentication,randomPost);   //for after refresh page
router.get("/getPostCount",Authentication,postCount);
router.patch("/editPost/:postId",Authentication,editPost);
router.delete("/deletePost/:postId",Authentication,deleteUserPost);

//User post likes api's---------------2
router.get("/post/:postId/likesPost",Authentication,likesPost);
router.get("/postLikedUserList/:postId",Authentication,getListOfUsersLikedPost);

//User post comments api's----------------5
router.post("/posts/:postId/comments",Authentication,commentValidations,createCommentOnPost);
router.get("/post/:postId/viewComments",Authentication,viewCommentOnPost);
router.patch("/post/:postId/updateComment/:commentId",Authentication,commentValidations,updateCommentOnPost)
router.delete("/posts/:postId/deleteComments/:commentId",Authentication,deleteCommentOnPost);
router.get("/getCommentCount/:postId",Authentication,commentCount);


//User sub-comments api's-------------------3
router.post("/post/:postId/comments/:commentId/subComments",Authentication,commentValidations,createSubCommentsOnPost);
router.patch("/post/:postId/updateSubComment/:subcommentId",Authentication,commentValidations,updateSubCommentOnPost);
router.delete("/post/:postId/subcomments/:subcommentId",Authentication,deleteSubCommentOnPost); 

// User Stories api's------------4
router.post("/postStories",Authentication,upload.fields([{ name: 'content', maxCount: 6 }]),postStories);
router.get("/viewStories/:storyId",Authentication,viewStories);
router.get("/viewBy/:storyId",Authentication,viewer);
router.delete("/deleteStories/:storyId",Authentication,deleteStories)


// for a invalid url---------------
router.all('/**',(req,res)=>{
 return res.status(400).send({message:"Your Request Is Invalid"})
})

module.exports=router;  

// overall 41 api's in this project--------------