import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  validatePostImage,
  getImageType,
  validatePost,
} from "../utilities/PostValidation.js";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ postId: id })
      .populate("userId", "profilePhoto")
      .sort({ createdAt: "desc" })
      .exec();

    res.json({
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
    const { error, value } = validatePost(req.body);
    //check for errors
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { id } = req.params;
    const { userId } = req;

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({
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
      content: value.content,
      hasImage,
      image,
    });

    const savedComment = await comment.save();

    if (!savedComment) {
      res.status(500).json({
        success: false,
        error: "something went wrong, couldn't get the comments",
      });
    }

    res.json({
      success: true,
      comment: savedComment,
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
  const filePath = `/uploads/comments/${req.params.imageName}`;

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
