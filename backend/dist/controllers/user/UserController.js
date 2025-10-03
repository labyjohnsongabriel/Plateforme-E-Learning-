"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { User, Apprenant, Administrateur, RoleUtilisateur, } = require("../../models/user/User");
const createError = require("http-errors");
class UserService {
    static async getAll() {
        return User.find({});
    }
    static async getById(id) {
        const user = await User.findById(id);
        if (!user)
            throw createError(404, "Utilisateur non trouvé");
        return user;
    }
    static async update(id, updates) {
        const user = await User.findById(id);
        if (!user)
            throw createError(404, "Utilisateur non trouvé");
        await user.mettreAJourProfil(updates);
        return user;
    }
    static async delete(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user)
            throw createError(404, "Utilisateur non trouvé");
        return user;
    }
}
class ApprenantService {
    static async getProgress(id) {
        const apprenant = await Apprenant.findById(id);
        if (!apprenant)
            throw createError(404, "Apprenant non trouvé");
        return apprenant.visualiserProgres();
    }
    static async getCertificats(id) {
        const certificats = await mongoose
            .model("Certificat")
            .find({ utilisateur: id });
        return certificats;
    }
}
class AdministrateurService {
    static async gererUtilisateurs() {
        const admin = await Administrateur.findOne(); // Supposons un admin connecté
        if (!admin)
            throw createError(403, "Accès non autorisé");
        return admin.gererUtilisateurs();
    }
    static async genererStatistiques() {
        const admin = await Administrateur.findOne();
        if (!admin)
            throw createError(403, "Accès non autorisé");
        return admin.genererStatistiques();
    }
}
const UserController = {
    getAll: async (req, res, next) => {
        try {
            const users = await UserService.getAll();
            res.json(users);
        }
        catch (err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        try {
            const user = await UserService.getById(req.params.id);
            res.json(user);
        }
        catch (err) {
            next(err);
        }
    },
    update: async (req, res, next) => {
        try {
            const user = await UserService.update(req.params.id, req.body);
            res.json(user);
        }
        catch (err) {
            next(err);
        }
    },
    delete: async (req, res, next) => {
        try {
            const user = await UserService.delete(req.params.id);
            res.json({ message: "Utilisateur supprimé", user });
        }
        catch (err) {
            next(err);
        }
    },
};
const ApprenantController = {
    getProgress: async (req, res, next) => {
        try {
            const progress = await ApprenantService.getProgress(req.params.id);
            res.json(progress);
        }
        catch (err) {
            next(err);
        }
    },
    getCertificats: async (req, res, next) => {
        try {
            const certificats = await ApprenantService.getCertificats(req.params.id);
            res.json(certificats);
        }
        catch (err) {
            next(err);
        }
    },
};
const AdministrateurController = {
    gererUtilisateurs: async (req, res, next) => {
        try {
            const users = await AdministrateurService.gererUtilisateurs();
            res.json(users);
        }
        catch (err) {
            next(err);
        }
    },
    genererStatistiques: async (req, res, next) => {
        try {
            const stats = await AdministrateurService.genererStatistiques();
            res.json(stats);
        }
        catch (err) {
            next(err);
        }
    },
};
module.exports = {
    UserController,
    ApprenantController,
    AdministrateurController,
};
//# sourceMappingURL=UserController.js.map