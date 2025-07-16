import mongoose from "mongoose";

const buySchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
    },
    courseId:{
        type:mongoose.Types.ObjectId,
        ref:"Course",
    },
    
})           

export const Buy = mongoose.model("Buy", buySchema)