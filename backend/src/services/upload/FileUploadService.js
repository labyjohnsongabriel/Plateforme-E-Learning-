const upload = require("../../config/upload");

exports.uploadFile = upload.single("file");
