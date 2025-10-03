"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../../models/user/User");
const types_1 = require("../../types");
class ProfileController {
}
_a = ProfileController;
ProfileController.getProfile = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Utilisateur non authentifié' });
            return;
        }
        console.log('Récupération du profil pour user ID:', req.user.id);
        const user = await User_1.User.findById(req.user.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        const response = {
            _id: user._id,
            prenom: user.prenom,
            nom: user.nom,
            email: user.email,
            role: user.role,
            avatar: user.avatar || null,
            level: user.level || null,
        };
        res.json({ data: response });
    }
    catch (error) {
        console.error('Erreur dans getProfile:', error.message);
        res.status(500).json({
            message: 'Erreur serveur lors de la récupération du profil',
            error: error.message,
        });
    }
};
ProfileController.updateProfile = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Utilisateur non authentifié' });
            return;
        }
        const updates = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        const response = {
            _id: user._id,
            prenom: user.prenom,
            nom: user.nom,
            email: user.email,
            role: user.role,
            avatar: user.avatar || null,
            level: user.level || null,
        };
        res.json({ data: response });
    }
    catch (error) {
        console.error('Erreur dans updateProfile:', error.message);
        res.status(500).json({
            message: 'Erreur serveur lors de la mise à jour du profil',
            error: error.message,
        });
    }
};
exports.default = ProfileController;
//# sourceMappingURL=ProfileController.js.map