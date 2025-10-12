"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const upload_1 = require("../config/upload");
// Middleware for handling single file upload
exports.uploadFile = upload_1.upload.single('file');
//# sourceMappingURL=FileUploadService.js.map