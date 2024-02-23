require("dotenv").config()
const userModel = require('../models/registrationModel');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require("nodemailer");
const mongoose = require('mongoose')

const userRegistration = async (req,res)=>{
    try{
        let data = req.body;
        let {name,password} = data;

        let profileImage = req.files['profileImage'] ? req.files['profileImage'].map(file => file.filename.replace('uploads\\', '')) : [];

        if (profileImage.length > 0) {
       data.profileImage = profileImage.join(';'); // You can choose any delimiter you like
       } else {
       data.profileImage = null; // Set images to null if there are no images
       }

       data.password = await bcrypt.hash(password,saltRounds); //hashing password---

            let savedData = await userModel.create(data);
            // emailId verifications
            const transporter = nodemailer.createTransport({ 
                service: process.env.SERVICE,
                auth: {
                    user:process.env.USER,
                    pass:process.env.PASS
                  }
            });
            var mailOptions = {
                from: process.env.USER,
                to: savedData.emailId,
                subject: 'verify your emailId',
                html: '<p>Hello '+name+', please click here to <a href="http://localhost:4000/verify?id='+savedData._id +'" style="background-color: #007fff; display: inline-block; padding: 2px; color: white; text-decoration: none;"><span style="font-size: 15px;">verify</span></a> your emailId.</p>'
            };
              transporter.sendMail(mailOptions,(err,info)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("email has been sent:- ", info.response);
                }
            })
            res.status(201).send({status:true,data:savedData, message:`${name} verify your emailId`})
    }catch(err){
            res.status(500).send({ status: false,message: `Sorry for the inconvenience caused`, message: err.message})
    }
};

const verifyEmail = async(req,res)=>{
    try{
         const updateInfo= await userModel.findOneAndUpdate({_id:req.query.id},{$set:{email_verified:true}})
         return res.status(200).send("your email has been verified")        
    }catch(err){
        res.status(500).send({ status: false,message: `Sorry for the inconvenience caused`, message: err.message})
    }
} 

const userLogin = async (req, res) => {
    try {
        let data = req.body;
        let { emailId, password } = data;
      
         let checkCredentials = await userModel.findOne({ emailId: emailId});           
            if (checkCredentials) {
                if(checkCredentials.email_verified===false){
                return res.status(400).send({ message: "Verify your emailId" });
                }
            }
        
        // Check if checkCredentials is defined
        if (!checkCredentials) {
            return res.status(401).send({ message: "emailId or password is not correct" });
        }

        let decryptPassword = await bcrypt.compare(password, checkCredentials.password)
        if (!decryptPassword) {
            return res.status(401).send({ message: "emailId or password is not correct" });
        } else {
            let token = jwt.sign({
                userId: checkCredentials._id.toString(),
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 1000000
            }, process.env.SECRET_KEY)
            res.status(201).send({ status: true, token: token, message: `You are Successfully loggedIn with this id:${checkCredentials._id}, ThankYou` })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, message: err.message })
    }
};

const forgetPassword = async(req,res)=>{
            try{
                let data = req.body;
                const {emailId,password} =data;
                // Checks whether email is empty or is enter as a string or is a valid email or already exists
                if (!emailId) return res.status(400).send({ status: false, message: "Please enter email" });
                if (typeof emailId !== "string") return res.status(400).send({ status: false, message: "Please enter email as a String" });   
                if (!/^([0-9a-z]([-_\\.]*[0-9a-z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(emailId)) return res.status(400).send({ status: false, message: "Entered email is invalid" });
                let findEmail = await userModel.findOne({ emailId: emailId });
                if(!findEmail) return res.status(404).send({status:false,message:"This emailId is not correct or not registered"});

                // Checks whether password is empty or is enter as a string or a valid pasword.
                if (!password) return res.status(400).send({ status: false, message: "Please enter Password" });
                if (typeof password !== "string") return res.status(400).send({ status: false, message: " Please enter password as a String" });
                let validPassword =/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
                if (!validPassword.test(password))return res.status(400).send({status: false, message: "Please enter min 8 letter password, with at least a symbol, upper and lower case letters and a number"});
                data.password = password.trim();

                data.password = await bcrypt.hash(password,saltRounds);
                let updatePassword = await userModel.findOneAndUpdate({_id:findEmail._id},data,{new:true});
                if(!updatePassword) return res.status(404).send({status:false,message:'user not found'})
                return res.status(200).send({status:true,message:"your password updated successfully",data:updatePassword})
            }catch(err){
                return res.status(500).send({status:false,message:err.message})
            }
}
module.exports={userRegistration,verifyEmail,userLogin,forgetPassword}