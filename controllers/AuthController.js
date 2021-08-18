import bcrypt from "bcryptjs";
import path from "path";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import {
  validateRegister,
  validateLogin,
} from "../utilities/AuthValidation.js";
import { FileValidation } from "../utilities/FileValidation.js";

const register = async (req, res) => {
  //validate the data body
  const { error, value } = validateRegister(req.body);

  //check for errors
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  try {
    //check if username is already in the database
    const isUser = await User.findOne({ userName: value.userName });
    console.log(isUser);
    if (isUser) {
      return res.status(400).json({
        success: false,
        error: "Username already exists, try another one",
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
    const hashedPassword = await bcrypt.hash(value.password, salt);
    if (!hashedPassword) {
      return res.status(500).json({
        success: false,
        error: "something went wrong, please try again",
      });
    }

    //validate profileImage;
    const file = req.files.profilePhoto;
    if (!file) {
      return res.status(500).json({
        success: false,
        error: "profilePhoto is required",
      });
    }
    const fileUploadError = FileValidation(file);

    if (fileUploadError) {
      return res.status(500).json({
        success: false,
        error: fileUploadError,
      });
    }
    //move the file to the uploads folder
    const fileName = `${value.userName}${path.extname(file.name)}`;
    file.mv(`./uploads/users/${fileName}`, async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          error: "Couldn't upload the profile image, please try again",
        });
      }
      //create the user
      const newUser = new User({
        ...value,
        profilePhoto: fileName,
        password: hashedPassword,
      });

      //save the user
      const savedUser = await newUser.save();
      if (!savedUser) {
        return res.status(500).json({
          success: false,
          error: "Couldn't create the user, please try again",
        });
      }
      // create the jwt token
      const token = jwt.sign({ id: savedUser._id }, process.env.TOKEN);

      return res.json({
        success: true,
        msg: "User created successfully",
        user: {
          id: savedUser._id,
          userName: savedUser.userName,
          lastName: savedUser.lastName,
          firstName: savedUser.firstName,
          about: savedUser.about,
          profilePhoto: savedUser.profilePhoto,
          token,
        },
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong, please try again",
    });
  }
};

const login = async (req, res) => {
  //validate the data body
  const { error, value } = validateLogin(req.body);

  //check for errors
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  try {
    //check for username
    const user = await User.findOne({ userName: value.userName });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Invalid username/password",
      });
    }

    // verify password
    const validPassword = await bcrypt.compare(value.password, user.password);
    if (!validPassword) {
      return res.status(404).json({
        success: false,
        error: "Invalid username/password",
      });
    }

    //create the jwt token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN);

    return res.json({
      success: true,
      msg: "User signed in successfully",
      user: {
        id: user._id,
        userName: user.userName,
        lastName: user.lastName,
        firstName: user.firstName,
        about: user.about,
        profilePhoto: user.profilePhoto,
        token,
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

export default { register, login };
