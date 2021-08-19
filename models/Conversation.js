import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    member_a: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    member_b: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    messages: [
      {
        _id: {
          type: String,
        },
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: {
          type: String,
        },
        sentAt: {
          type: Date,
        },
        hasImage: {
          type: Boolean,
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
    ],
    lastMessage: {
      _id: {
        type: String,
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      content: {
        type: String,
      },
      sentAt: {
        type: Date,
      },
      hasImage: {
        type: Boolean,
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
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
