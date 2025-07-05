import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
const app = express()
dotenv.config();
const port = process.env.PORT || 3000
const db_uri = process.env.MONGO_URI

try {
    await mongoose.connect(db_uri)
    console.log("database connected successfully")
} 
catch (error) {
    console.log("error connecting database" ,error)
}

app.get("/", (req,res)=>{
    res.send("jay shree krishna!!!<3")
})

app.listen(port , ()=>{
    console.log(`Server is running on port ${port}`)
})