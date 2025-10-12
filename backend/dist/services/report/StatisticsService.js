"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletionRate = exports.getRecentUsers = exports.getCourseStats = exports.getUserStats = exports.getGlobalStats = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const User_1 = require("../../models/user/User");
const Cours_1 = __importDefault(require("../../models/course/Cours")); // modèle par défaut
const Progression_1 = __importDefault(require("../../models/learning/Progression"));
const Certificat_1 = __importDefault(require("../../models/learning/Certificat"));
const Inscription_1 = __importDefault(require("../../models/learning/Inscription"));
// --- Statistiques globales ---
const getGlobalStats = async () => {
    try {
        const [usersCount, adminsCount, coursesCount, completionsCount, certificatesCount, enrollmentsCount,] = await Promise.all([
            User_1.User.countDocuments({ role: User_1.RoleUtilisateur.ETUDIANT }),
            User_1.User.countDocuments({ role: User_1.RoleUtilisateur.ADMIN }),
            Cours_1.default.countDocuments(),
            Progression_1.default.countDocuments({ pourcentage: 100 }),
            Certificat_1.default.countDocuments(),
            Inscription_1.default.countDocuments(),
        ]);
        const coursesByDomain = await Cours_1.default.aggregate([
            { $group: { _id: '$domaineId', count: { $sum: 1 } } },
        ]);
        const completionsByLevel = await Progression_1.default.aggregate([
            { $match: { pourcentage: 100 } },
            {
                $lookup: {
                    from: 'cours',
                    localField: 'cours',
                    foreignField: '_id',
                    as: 'coursDetails',
                },
            },
            { $unwind: '$coursDetails' },
            { $group: { _id: '$coursDetails.niveau', count: { $sum: 1 } } },
        ]);
        return {
            usersCount,
            adminsCount,
            coursesCount,
            completionsCount,
            certificatesCount,
            enrollmentsCount,
            coursesByDomain: coursesByDomain.reduce((acc, item) => ({ ...acc, [item._id.toString()]: item.count }), {}),
            completionsByLevel: completionsByLevel.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        };
    }
    catch (err) {
        console.error('Erreur lors de la récupération des stats globales:', err);
        throw err;
    }
};
exports.getGlobalStats = getGlobalStats;
// --- Statistiques pour un utilisateur ---
const getUserStats = async (userId) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, 'Utilisateur non trouvé');
        }
        const [enrollments, progressions, completions, certificates] = await Promise.all([
            Inscription_1.default.countDocuments({ apprenant: userId }),
            Progression_1.default.countDocuments({ apprenant: userId }),
            Progression_1.default.countDocuments({ apprenant: userId, pourcentage: 100 }),
            Certificat_1.default.countDocuments({ apprenant: userId }),
        ]);
        const averageProgressResult = await Progression_1.default.aggregate([
            { $match: { apprenant: userId } },
            { $group: { _id: null, avg: { $avg: '$pourcentage' } } },
        ]);
        return {
            user: { nom: user.nom, prenom: user.prenom, role: user.role },
            enrollments,
            progressions,
            completions,
            certificates,
            averageProgress: averageProgressResult[0]?.avg || 0,
        };
    }
    catch (err) {
        throw err;
    }
};
exports.getUserStats = getUserStats;
// --- Statistiques pour un cours ---
const getCourseStats = async (coursId) => {
    try {
        const cours = await Cours_1.default.findById(coursId).populate('domaineId', 'nom');
        if (!cours) {
            throw (0, http_errors_1.default)(404, 'Cours non trouvé');
        }
        const [enrollments, completions, certificates] = await Promise.all([
            Inscription_1.default.countDocuments({ cours: coursId }),
            Progression_1.default.countDocuments({ cours: coursId, pourcentage: 100 }),
            Certificat_1.default.countDocuments({ cours: coursId }),
        ]);
        return {
            cours: {
                titre: cours.titre,
                niveau: cours.niveau,
                domaine: cours.domaineId.nom, // nom du domaine après populate
            },
            enrollments,
            completions,
            certificates,
        };
    }
    catch (err) {
        throw err;
    }
};
exports.getCourseStats = getCourseStats;
// --- Utilisateurs récents ---
const getRecentUsers = async (limit = 10) => {
    return await User_1.User.find({ role: User_1.RoleUtilisateur.ETUDIANT })
        .sort({ dateInscription: -1 })
        .limit(limit)
        .select('nom prenom email dateInscription');
};
exports.getRecentUsers = getRecentUsers;
// --- Taux global de complétion ---
const getCompletionRate = async () => {
    const [totalEnrollments, totalCompletions] = await Promise.all([
        Inscription_1.default.countDocuments(),
        Progression_1.default.countDocuments({ pourcentage: 100 }),
    ]);
    return {
        rate: totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0,
    };
};
exports.getCompletionRate = getCompletionRate;
//# sourceMappingURL=StatisticsService.js.map