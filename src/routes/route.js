const express = require("express");
const router = express.Router();
const {userRegistration,verifyEmail,userLogin}= require("../controllers/userController");
const {userPost,getPost,randomPost,editPost,getListOfUsersLikedPost,likesPost,deleteUserPost,createCommentOnPost,deleteCommentOnPost,subCommentsOnPost, viewCommentOnPost}= require("../controllers/postController");
const {profileDetails,followerCount,editProfile,postCount,blockedUser}= require("../controllers/userProfileController")
const  {Authentication,Authorization} = require("../middleware/auth");
const { registrationValidations } = require("../middleware/registrationValidations.js")
// Api's-----
router.post("/registration",registrationValidations,userRegistration);
router.get("/verify",verifyEmail);
router.post("/login",userLogin);
router.get("/getProfile",Authentication,profileDetails);
router.patch("/editProfile",Authentication,editProfile);
router.post("/user/:userId/block",Authentication,blockedUser);

router.post("/userId/:userId/follow",Authentication,followerCount);

// post api's--------------------
router.post("/createPost",Authentication,userPost);
router.get("/getAllPost",getPost);
router.get("/randomPost",Authentication,randomPost);
router.get("/getPostCount",Authentication,postCount);
router.patch("/editPost/:postId",Authentication,editPost)
router.delete("/deletePost/:postId",Authentication,deleteUserPost)

// post likes api's---------------
router.get("/postLikedUserList/:postId",Authentication,getListOfUsersLikedPost)
router.get("/post/:postId/likesPost",Authentication,likesPost)

// post comments api's----------------
router.post("/posts/:postId/comments",Authentication,createCommentOnPost);
router.get("/post/:postId/viewComments",Authentication,viewCommentOnPost)
router.delete("/posts/:postId/deleteComments/:commentId",Authentication,deleteCommentOnPost);
router.post("/posts/:postId/comments/:commentId/sub-comments",Authentication,subCommentsOnPost);


 
router.all('/**',(req,res)=>{
 return res.status(400).send({message:"Your Request Is Invalid"})
})

module.exports=router;  