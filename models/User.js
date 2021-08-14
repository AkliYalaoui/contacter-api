import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    min: 4,
    max : 255
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max : 1024
  },
  firstName: {
    type: String,
    required: true,
    min: 4,
    max : 255
  },
  lastName: {
    type: String,
    required: true,
    min: 4,
    max : 255
  },
  profilePhoto: {
    type: String,
    required: true
  },
  about: {
    type: String,
    min: 4,
    max : 4096,
    required: true
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref : "Friend"
  }]

}, { timestamps: true });


export default mongoose.model("User", userSchema);