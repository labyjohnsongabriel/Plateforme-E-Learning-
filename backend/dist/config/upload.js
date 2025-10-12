"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'documents';
        if (file.mimetype.startsWith('video'))
            folder = 'videos';
        else if (file.mimetype.startsWith('image'))
            folder = 'images';
        cb(null, path_1.default.join(__dirname, '../../uploads', folder));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
exports.default = upload;
//# sourceMappingURL=upload.js.map