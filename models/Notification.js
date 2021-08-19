import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    read: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: true,
      max: 2048,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
