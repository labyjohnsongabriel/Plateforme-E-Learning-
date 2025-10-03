"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../../models/user/User");
exports.getAllUsers = async () => {
    return await User.find().select("-motDePasse"); // Sans MDP pour sécurité
};
exports.updateUser = async (userId, data) => {
    return await User.findByIdAndUpdate(userId, data, { new: true });
};
exports.deleteUser = async (userId) => {
    await User.findByIdAndDelete(userId);
    // Optionnel : Supprimer progressions, certs associés
};
//# sourceMappingURL=UserService.js.map