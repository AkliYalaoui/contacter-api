import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      max: 2048,
    },
    hasImage: {
      type: Boolean,
      required: true,
      default: true,
    },
    image: {
      type: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
