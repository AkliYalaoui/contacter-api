import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Post from "../models/Post.js";
import {
  validateUpdate,
  validatePassword,
} from "../utilities/UserValidation.js";
import { FileValidation } from "../utilities/FileValidation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, { password: 0 })
      .populate("friends", { password: 0 })
      .exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const posts = await Post.find({ userId: user.id }, { userId: 0 }).sort({
      createdAt: "desc",
    });

    return res.json({
      success: true,
      user,
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
const getImage = (req, res) => {
  const filePath = `/uploads/users/${req.params.imageName}`;

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

const updateProfile = async (req, res) => {
  const { userId } = req;
  //validate the data body
  const { error, value } = validateUpdate(req.body);

  //check for errors
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  try {
    //check if username is already in the database
    const isUser = await User.findOne({
      $and: [{ userName: value.userName }, { _id: { $ne: userId } }],
    });

    if (isUser) {
      return res.status(400).json({
        success: false,
        error: "Username already exists, try another one",
      });
    }

    let passwordUpdated = false;
    let hashedPassword;

    if (req.body.password) {
      const passwordValidation = validatePassword({
        password: req.body.password,
      });

      //check for errors
      if (passwordValidation.error) {
        return res.status(400).json({
          success: false,
          error: passwordValidation.error.details[0].message,
        });
      }

      //hash the password;
      const salt = await bcrypt.genSalt(10);
      if (!salt) {
        return res.status(500).json({
          success: false,
          error: "something went wrong, please try again",
        });
      }
      hashedPassword = await bcrypt.hash(value.password, salt);
      if (!hashedPassword) {
        return res.status(500).json({
          success: false,
          error: "something went wrong, please try again",
        });
      }
      passwordUpdated = true;
    }

    let fileUpdated = false;
    let fileName;
    if (req.files && req.files.profilePhoto) {
      //validate profileImage;
      const file = req.files.profilePhoto;
      const fileUploadError = FileValidation(file);

      if (fileUploadError) {
        return res.status(500).json({
          success: false,
          error: fileUploadError,
        });
      }
      //move the file to the uploads folder
      fileName = `${value.userName}${path.extname(file.name)}`;
      file.mv(`./uploads/users/${fileName}`, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            error: "Couldn't upload the profile image, please try again",
          });
        }
        fileUpdated = true;
      });
    }

    //get the user
    const user = await User.findById(userId);

    passwordUpdated && (user.password = hashedPassword);
    fileUpdated && (user.profilePhoto = fileName);
    user.about = value.about;
    user.userName = value.userName;
    user.firstName = value.firstName;
    user.lastName = value.lastName;

    //save the user
    const savedUser = await user.save();
    if (!savedUser) {
      return res.status(500).json({
        success: false,
        error: "Couldn't update the user, please try again",
      });
    }

    return res.json({
      success: true,
      msg: "User updated successfully",
      user: {
        id: savedUser._id,
        userName: savedUser.userName,
        lastName: savedUser.lastName,
        firstName: savedUser.firstName,
        about: savedUser.about,
        profilePhoto: savedUser.profilePhoto,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong, please try again",
    });
  }
};

const fetchUserProfileByUsername = async (req, res) => {
  try {
    const { userName } = req.params;
    const userRegex = new RegExp(`^${userName}`, "i");
    const results = await User.find({ userName: userRegex }).select("userName");

    res.json({
      success: true,
      results,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong, please try again",
    });
  }
};

export default { getImage, getUser, updateProfile, fetchUserProfileByUsername };
