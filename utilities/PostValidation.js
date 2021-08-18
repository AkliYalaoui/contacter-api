import Joi from "joi";

const validatePost = (data) =>
  Joi.object({
    content: Joi.string().trim().min(4).max(2048).required(),
  }).validate(data);

const validatePostImage = (file) => {
  let error = "";
  const types = [
    "image/gif",
    "image/png",
    "image/jpeg",
    "image/bmp",
    "image/webp",
    "image/svg",
    "video/mp4",
    "video/ogg",
    "video/webm",
  ];
  if (file.size > 25 * 2 ** 20) error = "File size must be less then 25MB";
  else if (file.truncated) error = "the file is over the size limit";
  else if (!types.includes(file.mimetype))
    error = "Accepted file type are " + types.join(", ");

  return error;
};
const getImageType = (file) => {
  if (file.mimetype.includes("video")) return "video";
  return "image";
};
export { validatePost, validatePostImage,getImageType };
