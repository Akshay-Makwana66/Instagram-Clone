require("dotenv").config()
const express = require("express");

const mongoose = require("mongoose");
const multer  = require('multer')
const routes = require("./routes/route")
const app = express();
// const upload = multer({ dest: 'uploads/' })
const port = process.env.PORT || 27017;
const mongodb_string = process.env.MONGO_URL || ""
app.use(express.json());
// app.use(multer().any())
app.use(express.urlencoded({extended:false}))
mongoose.connect(mongodb_string,{
    useNewUrlParser:true
}).then(()=>{console.log("mongodb is connected");
}).catch((err)=>{console.log(err)})

app.use("/",routes)

app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})