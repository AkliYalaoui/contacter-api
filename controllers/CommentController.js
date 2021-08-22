import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  validatePostImage,
  getImageType,
  validatePost,
} from "../utilities/PostValidation.js";
import { v4 as uuidv4 } from "uuid";
import Notification from "../models/Notification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(500).json({
        success: false,
        error: "something went wrong, could'n get the comments",
      });
    }
    const comments = await Comment.find({ postId: id })
      .populate("userId", "profilePhoto")
      .sort({ createdAt: "desc" })
      .exec();

    return res.json({
      success: true,
      comments,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong, could'n get the comments",
    });
  }
};
const addComment = async (req, res) => {
  try {
    //validate the data body
    let content = req.body.content;

    if (content && typeof content != "string") {
      return res.status(400).json({
        success: false,
        error: "Comment content must be a text",
      });
    }
    if (content) {
      content = content.trim();
    }

    if (!(req.files && req.files.commentPhoto) && !content) {
      return res.status(400).json({
        success: false,
        error: "Can't create an empty comment",
      });
    }

    const { id } = req.params;
    const { userId } = req;

    if (!id) {
      return res.status(404).json({
        success: false,
        error: "Post not found, couldn't upload your comment",
      });
    }
    const post = await Post.findById(id);
    const user = await User.findById(userId).select("userName profilePhoto");

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found, couldn't upload your comment",
      });
    }

    let hasImage = false;
    let image = {
      type: "",
      url: "",
    };

    if (req.files && req.files.commentPhoto) {
      //validate Image;
      const file = req.files.commentPhoto;
      const fileUploadError = validatePostImage(file);

      if (fileUploadError) {
        return res.status(500).json({
          success: false,
          error: fileUploadError,
        });
      }

      //move the file to the uploads folder
      const fileName = `${uuidv4()}${path.extname(file.name)}`;
      file.mv(`./uploads/comments/${fileName}`, async (err) => {
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
    const comment = new Comment({
      userId,
      postId: id,
      content: content,
      hasImage,
      image,
    });

    const savedComment = await comment.save();
    const commentNotification = new Notification({
      type: "comment",
      postId: id,
      content: content ? content : "commented with a photo",
      from: userId,
      to: post.userId,
    });
    const savedCommentNotification = await commentNotification.save();

    if (!savedComment || !savedCommentNotification) {
      return res.status(500).json({
        success: false,
        error: "something went wrong, couldn't get the comments",
      });
    }

    return res.json({
      success: true,
      comment: savedComment,
      notification: commentNotification,
      from: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong, couldn't get the comments",
    });
  }
};
const getImage = (req, res) => {
  const filePath = `/uploads/comments/${decodeURI(req.params.imageName ?? "")}`;

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

export default { getComments, addComment, getImage };
