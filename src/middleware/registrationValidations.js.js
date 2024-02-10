const userModel = require("../models/registrationModel");

const registrationValidations = async function (req, res, next) {
  try {
    let data = req.body; 
    const {name,emailId,password,userName,gender,mobile,profile} = data;
    // Checks whether body is empty or not
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Body cannot be empty" });

    // Checks whether name is empty or is enter as a string or contains only letters
    if (!name) return res.status(400).send({ status: false, message: "Please enter name" });
    if (typeof name !== "string") return res.status(400).send({ status: false, message: " Please enter name as a String" });
    let validname = /^[a-zA-Z\s]+$/;
    if (!validname.test(name)) return res.status(400).send({ status: false, message: "The name may contain only letters" });
    data.name = name.trim();

    // Checks whether email is empty or is enter as a string or is a valid email or already exists
    if (!emailId) return res.status(400).send({ status: false, message: "Please enter email" });
    if (typeof emailId !== "string") return res.status(400).send({ status: false, message: "Please enter email as a String" });   
    if (!/^([0-9a-z]([-_\\.]*[0-9a-z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(emailId)) return res.status(400).send({ status: false, message: "Entered email is invalid" });
    let duplicateEmail = await userModel.findOne({ emailId: emailId });
    if (duplicateEmail !== null && duplicateEmail.length !== 0) return res.status(400).send({ status: false, message: `${emailId} already exists` });
    
    // Checks whether password is empty or is enter as a string or a valid pasword.
    if (!password) return res.status(400).send({ status: false, message: "Please enter Password" });
    if (typeof password !== "string") return res.status(400).send({ status: false, message: " Please enter password as a String" });
    let validPassword =/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
    if (!validPassword.test(password))return res.status(400).send({status: false, message: "Please enter min 8 letter password, with at least a symbol, upper and lower case letters and a number"});
    data.password = password.trim();

    // Checks whether username is empty or is enter as a string or contains only letters,numbers,symbols and space
    if (!userName) return res.status(400).send({ status: false, message: "Please enter username" });
    if (typeof userName !== "string") return res.status(400).send({ status: false, message: "Please enter username as a String" });
    let validuserName = /^[a-zA-Z0-9\s\p{P}]+$/;    
    if (!validuserName.test(userName)) return res.status(400).send({ status: false, message: "The username may contain only letters,numbers,symbols,space" });
    data.userName = userName.trim();

    // Checks whether gender is empty or is enter as a string or contains the enumerator values or not.
    if (!gender) return res.status(400).send({ status: false, message: " Please enter gender" });
    if (typeof gender !== "string") return res.status(400).send({ status: false, message: "Please enter gender as a String" });     
    let titles = ["Male", "Female", "Other"];
    if (!titles.includes(gender)) return res.status(400).send({status: false,message: "Please enter gender as Male, Female and  Others"});         
    data.gender = gender.trim();

    // Checks whether mobile is empty or is enter as a number or is a valid number or already exists
    if (!mobile) return res.status(400).send({ status: false, message: "Please Enter Mobile Number" });
    if (typeof mobile !== "number") return res.status(400).send({ status: false, message: " Please enter only mobile number of 10 digits & write it in in number" });
    let validMobile = /^[6-9]\d{9}$/
    if (!validMobile.test(mobile)) return res.status(400).send({ status: false, message: "The user mobile number should be indian may contain only 10 number" });
    let duplicateMobile = await userModel.findOne({ mobile: mobile });
    if (duplicateMobile !== null && duplicateMobile.length !== 0) return res.status(400).send({ status: false, message: `${mobile} already exists` });

    // Checks whether profile is empty or is enter as a string or contains the enumerator values or not.
    if (profile) {
      if (typeof profile !== "string") return res.status(400).send({ status: false, message: "Please enter profile as a String" });     
      let status = ["Public", "Private"];
      if (!status.includes(profile)) return res.status(400).send({status: false,message: "Please enter profile as Public and Private"});         
      data.profile = profile.trim();
    }
    next();
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { registrationValidations };