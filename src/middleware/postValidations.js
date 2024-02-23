const userModel = require("../models/registrationModel");

const postValidations = async function (req, res, next) {
  try {
    let data = req.body; 
    const {text,postStatus} = data;
    data.userId = req.userId;

    // Checks whether name is empty or is enter as a string or contains only letters
    if (text) {
      if (typeof text !== "string") return res.status(400).send({ status: false, message: " Please enter text as a String" });
      data.text = text.trim();
    }

    // Checks whether post is empty or is enter as a string or contains the enumerator values or not.
    if (postStatus) {
      if (typeof postStatus !== "string") return res.status(400).send({ status: false, message: "Please enter postStatus as a String" });     
      let status = ["Public", "Private"];
      if (!status.includes(postStatus)) return res.status(400).send({status: false,message: "Please enter postStatus as Public and Private"});         
      data.postStatus = postStatus.trim();
    }
    next();
       
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const commentValidations = async function (req, res, next) {
  try {
    let data = req.body; 
    // Checks whether body is empty or not
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Body cannot be empty" });
    // Checks whether comments.text exists and is a string
    if (!data.comments || typeof data.comments.text !== "string") return res.status(400).send({ status: false, message: "Please provide a valid comment text" });
   
    next();
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};





module.exports = { postValidations,commentValidations };