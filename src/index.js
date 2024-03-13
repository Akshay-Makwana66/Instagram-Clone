require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/route")
const app = express();
const port = process.env.PORT || 27017;
const mongodb_string = process.env.MONGO_URL || ""
app.use(express.json());


mongoose.connect(mongodb_string).then(()=>{console.log("mongodb is connected");
}).catch((err)=>{console.log(err)})


app.use("/",routes)

app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})