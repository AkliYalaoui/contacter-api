import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
      min: 4,
      max: 2048,
    },
    image: {
      type: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    comments: [
      {
        _id: {
          type: String,
        },
        owner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        publishedAt: {
          type: Date,
        },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
