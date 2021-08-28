import Conversation from "../models/Conversation.js";
import { v4 as uuidv4 } from "uuid";
import {
  validatePostImage,
  getImageType,
} from "../utilities/PostValidation.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { FileValidation } from "../utilities/FileValidation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    if (!conversationId) {
      return res.status(404).json({
        success: false,
        error: "Couldn't retrieve the messages for this conversation",
      });
    }
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
    let content = req.body.content;

    if (content && typeof content != "string") {
      return res.status(400).json({
        success: false,
        error: "Message content must be a text",
      });
    }
    if (content) {
      content = content.trim();
    }

    if (!(req.files && req.files.messagePhoto) && !content) {
      return res.status(400).json({
        success: false,
        error: "Can't create an empty message",
      });
    }

    const { userId } = req;
    const conversationId = req.params.id;

    if (!conversationId) {
      return res.status(404).json({
        success: false,
        error: "Couldn't send  the message to this conversation",
      });
    }
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

    let hasImage = false;
    let image = {
      type: "",
      url: "",
    };

    if (req.files && req.files.messagePhoto) {
      //validate Image;
      const file = req.files.messagePhoto;
      const fileUploadError = validatePostImage(file);

      if (fileUploadError) {
        return res.status(500).json({
          success: false,
          error: fileUploadError,
        });
      }

      //move the file to the uploads folder
      const fileName = `${uuidv4()}${path.extname(file.name)}`;
      file.mv(`./uploads/messages/${fileName}`, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            error: "Couldn't upload the image, please try again",
          });
        }
      });

      hasImage = true;
      image.url = fileName;
      image.type = getImageType(file);
    }

    const message = {
      _id: uuidv4(),
      sender: userId,
      content: content,
      sentAt: new Date(),
      hasImage,
      image,
    };

    conversation.messages.push(message);
    conversation.lastMessage = {
      ...message,
      content: content ? content : "sent an attachement",
    };

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

const getImage = (req, res) => {
  const filePath = `/uploads/messages/${req.params.imageName}`;

  fs.access(`./${filePath}`, (err) => {
    if (err) {
      console.log(err);
      return res.status(404).json({
        success: false,
        error: "Image not found",
      });
    }
    const tmp = __dirname.split(path.sep);
    return res.sendFile(
      `${tmp.slice(0, tmp.length - 1).join(path.sep)}${filePath}`
    );
  });
};
const getBackground = (req, res) => {
  const filePath = `/uploads/backgrounds/${req.params.imageName}`;

  fs.access(`./${filePath}`, (err) => {
    if (err) {
      console.log(err);
      return res.status(404).json({
        success: false,
        error: "Image not found",
      });
    }
    const tmp = __dirname.split(path.sep);
    return res.sendFile(
      `${tmp.slice(0, tmp.length - 1).join(path.sep)}${filePath}`
    );
  });
};

const updateConversation = async (req, res) => {
  try {
    const { userId } = req;
    const conversationId = req.params.id;

    if (!conversationId) {
      return res.status(404).json({
        success: false,
        error: "Couldn't update this conversation",
      });
    }
    const conversation = await Conversation.findOne({
      $and: [
        { _id: conversationId },
        { $or: [{ member_a: userId }, { member_b: userId }] },
      ],
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Couldn't send update this conversation",
      });
    }

    //update the conversation
    let { nickName_a, nickName_b } = req.body;

    if (
      (nickName_a && typeof nickName_a != "string") ||
      (nickName_b && typeof nickName_b != "string")
    ) {
      return res.status(400).json({
        success: false,
        error: "nicnkames must be a text",
      });
    }
    if (nickName_a) {
      nickName_a = nickName_a.trim();
    }
    if (nickName_b) {
      nickName_b = nickName_b.trim();
    }

    let background = "";
    if (req.files && req.files.background) {
      //validate Image;
      const file = req.files.background;
      const fileUploadError = FileValidation(file);

      if (fileUploadError) {
        return res.status(500).json({
          success: false,
          error: fileUploadError,
        });
      }

      //move the file to the uploads folder
      const fileName = `${Date.now()}-${conversationId}${path.extname(
        file.name
      )}`;
      file.mv(`./uploads/backgrounds/${fileName}`, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            error: "Couldn't upload the image, please try again",
          });
        }
      });
      background = fileName;
    }

    background &&
      conversation.background &&
      fs.unlink(`./uploads/backgrounds/${conversation.background}`, (err) => {
        if (err) {
          console.log(err);
        }
      });
    conversation.nickName_a = nickName_a;
    conversation.nickName_b = nickName_b;
    background && (conversation.background = background);

    const updatedConversation = await conversation.save();
    if (!updateConversation) {
      res.status(500).json({
        success: false,
        error:
          "something went wrong while trying to update the conversation,please try again",
      });
    }
    res.json({
      success: true,
      nickName_a: updatedConversation.nickName_a,
      nickName_b: updatedConversation.nickName_b,
      background: updatedConversation.background,
    });
    /***************/
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to update the conversation,please try again",
    });
  }
};

export default {
  getConversations,
  getMessages,
  saveMessage,
  getImage,
  updateConversation,
  getBackground,
};
