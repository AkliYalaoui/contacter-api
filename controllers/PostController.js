import {
  validatePost,
  validatePostImage,
  getImageType,
} from "../utilities/PostValidation.js";
import { v4 as uuidv4 } from "uuid";
import Post from "../models/Post.js";
import User from "../models/User.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createPost = async (req, res) => {
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
    //user Id
    const { userId } = req;

    let fileName = "";
    let hasImage = false;
    let file = "";
    //validate Image;
    if (req.files && req.files.postPhoto) {
      file = req.files.postPhoto;

      const fileUploadError = validatePostImage(file);

      if (fileUploadError) {
        return res.status(500).json({
          success: false,
          error: fileUploadError,
        });
      }
      //move the file to the uploads folder
      fileName = `${uuidv4()}${path.extname(file.name)}`;
      file.mv(`./uploads/posts/${fileName}`, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            error: "Couldn't upload the image, please try again",
          });
        }
      });
      hasImage = true;
    }
    //create the post
    const post = new Post({
      userId,
      content: value.content,
      hasImage,
      image: {
        url: fileName,
        type: file ? getImageType(file) : "",
      },
    });

    const savedPost = await post.save();

    if (!savedPost) {
      return res.status(500).json({
        success: false,
        error: "Couldn't create the post, please try again",
      });
    }
    return res.json({
      success: true,
      msg: "Post uploaded successfully",
      post,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong, please try again",
    });
  }
};

const getImage = (req, res) => {
  const filePath = `/uploads/posts/${req.params.imageName}`;

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
const getHomePosts = async (req, res) => {
  try {
    const { userId } = req;
    const { _id, friends } = await User.findById(userId).select("friends");
    const postsOwners = [_id, ...friends];

    const posts = await Post.find({ userId: { $in: postsOwners } })
      .populate("userId", { password: 0 })
      .sort({ createdAt: "desc" })
      .exec();

    res.json({
      success: true,
      posts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong, please try again",
    });
  }
};
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({
        success: false,
        error: "post not found",
      });
    }
    const post = await Post.findById(id)
      .populate("userId", { password: 0 })
      .exec();

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "post not found",
      });
    }
    return res.json({
      success: true,
      post,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong, please try again",
    });
  }
};

export default { createPost, getImage, getHomePosts, getPostById };
