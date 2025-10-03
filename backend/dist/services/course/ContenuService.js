"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Contenu = require("../../models/course/Contenu");
exports.create = async (data, file) => {
    const type = file.mimetype.startsWith("video") ? "video" : "document";
    const ContenuModel = type === "video"
        ? require("../../models/course/ContenuVideo")
        : require("../../models/course/ContenuDocument");
    const contenu = new ContenuModel({
        ...data,
        [`url${type.charAt(0).toUpperCase() + type.slice(1)}`]: file.path,
    });
    await contenu.save();
    return contenu;
};
//# sourceMappingURL=ContenuService.js.map