const userModel = require("../models/registrationModel");
const storyModel = require("../models/storyModel");

const postStories = async (req, res) => {
    try {
        // Store post stories as separate strings in the array
        let stories = req.files['stories'] ? req.files['stories'].map(file => file.filename.replace('uploads\\', '')) : [];
        let findUser= await userModel.findOne({_id:req.userId,isDeactivated:false,isDeleted:false,isLogout:false});
        if(!findUser) return res.status(404).send({status:false,message:"you are not registered/loggedin User"});

        // Create a new story document
        let savedData = await storyModel.create({
            stories: [{
                user: req.userId,
                stories: stories
            }]
        })
        // Populate the user field to include user details
        savedData = await storyModel.populate(savedData, { path: 'stories.user', select: 'name' });

        // Send success response
        return res.status(201).send({ status: true, message: "Data created", Data: savedData });
    } catch (err) {
        // Send error response
        return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
    }
};

const viewStories = async (req,res)=>{
    try{
        let storyId = req.params.storyId;
        let viewStory = await storyModel.findOneAndUpdate({_id:storyId},{$addToSet:{viewBy:req.userId},$inc:{"stories.viewers.$.viewersCount":1}},{new:true}).populate({path:"stories.user",select:'name followedBy'})
        if(viewStory.followedBy.includes(req.userId)) return res.status(404).send({status:false,message:"you cannot view this story"})
        return res.status(200).send({status:true,message:"stories",story:viewStory})
    }catch(err){
        return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
    }
};

const deleteStories = async (req,res)=>{
            try{
                let storyId = req.params.storyId;
                let deleteStory = await storyModel.deleteOne({_id:storyId});
                if(!deleteStory) return res.status(404).send({status:false,message:"you cannot delete this story"})
                return res.status(200).send({status:true,message:"story deleted"})
            }catch(err){
                return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message });
            }
};
module.exports = {postStories,viewStories,deleteStories}