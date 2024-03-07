const userModel = require("../models/registrationModel");
const storyModel = require("../models/storyModel");

const postStories = async (req, res) => {
    try {
        // Store post stories as separate strings in the array
        let content = req.files['content'] ? req.files['content'][0].filename.replace('uploads\\', '') : '';
        let findUser = await userModel.findOne({_id:req.userId,isDeactivated:false,isDeleted:false,isLogout:false});
        
        // Check if user exists
        if (!findUser) return res.status(404).send({ status: false, message: "You are not a registered/logged-in user" });

        // Validate content format
        const allowedImageFormats = ['jpg', 'jpeg', 'png', 'gif'];
        const allowedVideoFormats = ['mp4', 'avi', 'mov'];

        let fileExtension = content.split('.').pop().toLowerCase();

        // Check if the file format is allowed
        if (!allowedImageFormats.includes(fileExtension) && !allowedVideoFormats.includes(fileExtension)) {
            return res.status(400).send({ status: false, message: "Invalid file format. Only images (JPG, JPEG, PNG, GIF) and videos (MP4, AVI, MOV) are allowed." });
        }

        // Create a new story document
        let savedData = await storyModel.create({ user: req.userId, content: content });

        // Populate the user field to include user details
        savedData = await storyModel.populate(savedData, { path: 'user', select: 'name' });

        // Send success response
        return res.status(201).send({ status: true, message: "Data created", Data: savedData });
    } catch (err) {
        // Send error response
        return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
    }
};

const viewStories = async (req, res) => {
    try {
        const storyId = req.params.storyId;

        // checking if profile is private then no one can see post stories of a private profile------------
        let checkStoriesPublic = await storyModel.findOne({_id:storyId}).populate("user","profileStatus");
        if(checkStoriesPublic.user.profileStatus!=='Public'){
            return res.status(400).send({status:false,message:"sorry , it is private profile so you cannot see this stories"})
        }
        // Check if the story belongs to the user
        let checkPostUser = await storyModel.findOne({ _id: storyId, user: req.userId }).populate(({path:'user',select:'name profileStatus'})).populate('viewers.user', 'name')
        
        if (checkPostUser) {
            return res.status(200).send({ status: true, story: checkPostUser });
        }

        
        let checkViewers = await storyModel.findOne({ _id: storyId, 'viewers.user': req.userId }).populate('viewers.user', 'name').populate({path:'user',select:'name profileStatus'})

        if (checkViewers) {
            return res.status(200).send({ status: true, story: checkViewers });
        }
        
        // Update the viewers array of the story
        let addViewers = await storyModel.findOneAndUpdate(
            { _id: storyId, 'viewers.user': { $nin: [req.userId] } },
            { $addToSet: { viewers: { user: req.userId } }, $inc: { viewersCount: 1 } },
            { new: true }
            ).populate('viewers.user', 'name').populate({path:'user',select:'name profileStatus'})
            
            if (!addViewers) {
                return res.status(404).send({ status: false, message: "story not found" });
            }
           

        return res.status(200).json({ status: true, message: "Story viewed successfully", story: addViewers });

    } catch (err) {
        return res.status(500).json({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });
    }
};

 
const viewer = async(req,res)=>{
            try{
                let storyId = req.params.storyId
                let viewBy = await storyModel.findOne({_id:storyId,user:req.userId}).select({user:1,content:1,viewersCount:1,viewers:1,_id:0})
                .populate({path:'user',select:'name'})
                .populate({path:'viewers.user',select:'name'})
                if(!viewBy){
                    return res.status(404).send({status:false,message:"story not found or you are not authorised to see viewer"})
                }
                return res.status(200).send({status:true,message:'viewer list',viewedBy:viewBy})

            }catch(err){
                return res.status(500).json({ status: false, message: "Sorry for the inconvenience caused", msg: err.message });
            }
};

const deleteStories = async (req,res)=>{
            try{
                let storyId = req.params.storyId;
                let findUser= await userModel.findOne({_id:req.userId,isDeactivated:false,isDeleted:false,isLogout:false});
                if(!findUser) return res.status(404).send({status:false,message:"you are not registered/loggedin User"});
        
                let deleteStory = await storyModel.deleteOne({_id:storyId});
                if(!deleteStory) return res.status(404).send({status:false,message:"you cannot delete this story"})
                return res.status(200).send({status:true,message:"story deleted"})
            }catch(err){
                return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
            }
};
 
module.exports = {postStories,viewStories,viewer,deleteStories}