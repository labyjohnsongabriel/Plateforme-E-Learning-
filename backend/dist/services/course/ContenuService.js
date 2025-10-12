"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ContenuVideo_1 = __importDefault(require("../../models/course/ContenuVideo"));
const ContenuDocument_1 = __importDefault(require("../../models/course/ContenuDocument"));
// Create a new contenu (video or document)
const create = async (data, file) => {
    const type = file.mimetype.startsWith('video') ? 'video' : 'document';
    const ContenuModel = type === 'video' ? ContenuVideo_1.default : ContenuDocument_1.default;
    const contenu = new ContenuModel({
        ...data,
        [`url${type.charAt(0).toUpperCase() + type.slice(1)}`]: file.path,
    });
    await contenu.save();
    return contenu;
};
exports.create = create;
//# sourceMappingURL=ContenuService.js.map