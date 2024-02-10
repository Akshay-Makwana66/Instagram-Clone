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
            data.password = await bcrypt.hash(password,saltRounds);
            let savedData = await userModel.create(data);
            // emailId verifications
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user:"akshaymakwana350@gmail.com",
                    pass: "pqizuldmsquimjdz"
                  }
            });
            var mailOptions = {
                from: 'akshaymakwana350@gmail.com',
                to: savedData.emailId,
                subject: 'verify your mail',
                html: '<p>Hello '+name+', please click here to <a href="http://localhost:4000/verify?id='+savedData._id +'"> verify </a> your mail.</p>'
            };
              transporter.sendMail(mailOptions,(err,info)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("email has been sent:- ", info.response);
                }
            })
            res.status(201).send({status:true,data:savedData, message:`${name} Your Registration Is Successfully Done`})
    }catch(err){
        res.status(500).send({ status: false,message: `Sorry for the inconvenience caused`, msg: err.message})
    }
}

const verifyEmail = async(req,res)=>{
    try{
         const updateInfo= await userModel.findOneAndUpdate({_id:req.query.id},{$set:{is_varified:1}})
          return res.status(200).send({status:true,message:"your email has been verified"})
        
    }catch(err){
        res.status(500).send({ status: false,message: `Sorry for the inconvenience caused`, msg: err.message})
    }
} 

const userLogin = async (req, res) => {
    try {
        let data = req.body;
        let { emailId, mobile, password } = data;
        let checkCredentials;

        if (emailId) {
            checkCredentials = await userModel.findOne({ emailId: emailId});           
            if (!checkCredentials) {
                return res.status(401).send({ message: "Your email-id is not correct" });
            }
        } else {
            if (mobile) {
                checkCredentials = await userModel.findOne({ mobile: mobile })
                if (!checkCredentials) {
                    return res.status(401).send({ message: "Your mobile is not correct" });
                }
            }  
        }
        // Check if checkCredentials is defined
        if (!checkCredentials) {
            return res.status(401).send({ message: "User not found" });
        }

        let decryptPassword = await bcrypt.compare(password, checkCredentials.password)
        if (!decryptPassword) {
            return res.status(401).send({ message: "Your password is not correct" });
        } else {
            let token = jwt.sign({
                userId: checkCredentials._id.toString(),
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 1000000
            }, 'insta-clone')
            res.status(201).send({ status: true, token: token, message: `You are Successfully loggedIn with this id:${checkCredentials._id}, ThankYou` })
        }

    } catch (err) {
        return res.status(500).send({ status: false, message: `Sorry for the inconvenience caused`, msg: err.message })
    }
};
module.exports={userRegistration,verifyEmail,userLogin}