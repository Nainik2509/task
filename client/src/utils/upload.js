const multer = require("multer");
const path = require("path");
const APIError = require("./APIError");
const fs = require("fs");

const {
  INVALID_FILE_TYPE,
  ENOT_ACCESS,
  FORBIDDEN,
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
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/" + req.query.folder + "/");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, err => {
        const error = new APIError({
          errors: [err],
          message: ENOT_ACCESS,
          status: FORBIDDEN
        });
        return cb(error, false);
      });
    }
    cb(null, dir);
  },
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

const upload = multer({
  storage,
  // fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
  }
});

module.exports = upload;
