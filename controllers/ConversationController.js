import Conversation from "../models/Conversation.js";
import { v4 as uuidv4 } from "uuid";

const getConversations = async (req, res) => {
  try {
    const { userId } = req;

    const conversations = await Conversation.find(
      {
        $or: [{ member_a: userId }, { member_b: userId }],
      },
      { messages: 0 }
    )
      .populate("member_a member_b", { password: 0 })
      .sort({ updatedAt: "desc" })
      .exec();

    res.json({
      success: true,
      conversations,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to get the conversations,please try again",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { userId } = req;
    const conversation = await Conversation.findOne({
      $and: [
        { _id: conversationId },
        { $or: [{ member_a: userId }, { member_b: userId }] },
      ],
    })
      .populate("member_a member_b", { password: 0 })
      .exec();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Couldn't retrieve the messages for this conversation",
      });
    }

    return res.json({
      success: true,
      conversation,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to retrieve the messages,please try again",
    });
  }
};

const saveMessage = async (req, res) => {
  try {
    const { userId } = req;
    const conversationId = req.params.id;
    const { msg } = req.body;

    const conversation = await Conversation.findOne({
      $and: [
        { _id: conversationId },
        { $or: [{ member_a: userId }, { member_b: userId }] },
      ],
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Couldn't send  the message to this conversation",
      });
    }

    const message = {
      _id: uuidv4(),
      sender: userId,
      content: msg,
      sentAt: new Date(),
    };

    conversation.messages.push(message);
    conversation.lastMessage = message;

    const updatedConversation = await conversation.save();
    if (!updatedConversation) {
      return res.status(500).json({
        success: false,
        error:
          "something went wrong while trying to send the message,please try again",
      });
    }

    return res.json({
      success: true,
      message,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to send the message,please try again",
    });
  }
};
export default { getConversations, getMessages, saveMessage };
