"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getAllUsers = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const User_1 = __importDefault(require("../../models/user/User"));
const Progression_1 = __importDefault(require("../../models/learning/Progression"));
const Certificat_1 = __importDefault(require("../../models/learning/Certificat"));
// Get all users
const getAllUsers = async () => {
    try {
        return await User_1.default.find().select('-motDePasse');
    }
    catch (err) {
        throw (0, http_errors_1.default)(500, `Erreur lors de la récupération des utilisateurs: ${err.message}`);
    }
};
exports.getAllUsers = getAllUsers;
// Update a user
const updateUser = async (userId, data) => {
    try {
        const user = await User_1.default.findByIdAndUpdate(userId, data, { new: true });
        if (!user) {
            throw (0, http_errors_1.default)(404, 'Utilisateur non trouvé');
        }
        return user;
    }
    catch (err) {
        throw (0, http_errors_1.default)(500, `Erreur lors de la mise à jour de l'utilisateur: ${err.message}`);
    }
};
exports.updateUser = updateUser;
// Delete a user
const deleteUser = async (userId) => {
    try {
        const user = await User_1.default.findByIdAndDelete(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, 'Utilisateur non trouvé');
        }
        // Optionally delete associated progressions and certificates
        await Progression_1.default.deleteMany({ apprenant: userId });
        await Certificat_1.default.deleteMany({ apprenant: userId });
    }
    catch (err) {
        throw (0, http_errors_1.default)(500, `Erreur lors de la suppression de l'utilisateur: ${err.message}`);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=UserService.js.map