const multer = require("multer");
const path = require("path");
const APIError = require("./APIError");

const {
  INVALID_FILE_TYPE,
  BAD_REQUEST
} = require("./constants");

const fileFilter = (req, file, cb) => {
  const type = /\.(gif|jpg|jpeg|tiff|png|webp|text)$/i.test(file.originalname);
  if (!type) {
    const err = new APIError({
      message: INVALID_FILE_TYPE,
      status: BAD_REQUEST
    });
    return cb(err, false);
  }
  return cb(null, true);
};

/**
 * Upload File locally Using Multer
 * Store file in memory without moving to system storage
 */
// const storage = multer.memoryStorage();

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    var ext = file.originalname.split(".").pop();
    var name =
      new Date().getTime() +
      "_" +
      Math.random()
        .toString(36)
        .substr(2, 5);
    cb(null, `${name}.${ext}`);
  }
});

const cloudinaryUpload = multer({
  storage,
  // fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
  }
});

module.exports = cloudinaryUpload;
