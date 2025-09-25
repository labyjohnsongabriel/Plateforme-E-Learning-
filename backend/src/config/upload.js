const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "documents";
    if (file.mimetype.startsWith("video")) folder = "videos";
    else if (file.mimetype.startsWith("image")) folder = "images";
    cb(null, path.join(__dirname, "../../uploads", folder));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

module.exports = multer({ storage });
