import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
    requester:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:Number,
        default:0
    }
},{timestamps:true});

export default mongoose.model("Friend",friendSchema);