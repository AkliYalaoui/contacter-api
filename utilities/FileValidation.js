const FileValidation = file => {
  let error = "";
  if (file.size > 10 * (2 ** 20))
    error = "File size must be less then 10MB";
  else if (file.truncated)
    error = "the file is over the size limit";
  else if (!["image/gif", "image/png", "image/jpeg", "image/bmp", "image/webp"].includes(file.mimetype))
    error = "Accepted file type are gif png jpeg bmp webp";
  
  return error;

};

export { FileValidation };