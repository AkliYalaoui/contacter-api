import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getLoggedUser = async (req, res) => {
  try {
    const loggedUser = await User.findById(req.userId, { password: 0 });
    if (!LoggedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    return res.json({
      success: true,
      user: loggedUser,
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

export default { getImage, getLoggedUser };
