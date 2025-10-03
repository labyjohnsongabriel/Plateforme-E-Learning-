"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../../models/user/User");
const Cours = require("../../models/course/Cours");
const Progression = require("../../models/learning/Progression");
const Certificat = require("../../models/learning/Certificat");
const Inscription = require("../../models/learning/Inscription");
exports.getGlobalStats = async () => {
    try {
        const [usersCount, adminsCount, coursesCount, completionsCount, certificatesCount, enrollmentsCount,] = await Promise.all([
            User.countDocuments({ role: "APPRENANT" }), // Apprenants seulement
            User.countDocuments({ role: "ADMINISTRATEUR" }),
            Cours.countDocuments(),
            Progression.countDocuments({ pourcentage: 100 }),
            Certificat.countDocuments(),
            Inscription.countDocuments(),
        ]);
        // Stats par domaine (agrégation)
        const coursesByDomain = await Cours.aggregate([
            { $group: { _id: "$domaine", count: { $sum: 1 } } },
        ]);
        // Complétions par niveau
        const completionsByLevel = await Progression.aggregate([
            { $match: { pourcentage: 100 } },
            {
                $lookup: {
                    from: "cours",
                    localField: "cours",
                    foreignField: "_id",
                    as: "coursDetails",
                },
            },
            { $unwind: "$coursDetails" },
            { $group: { _id: "$coursDetails.niveau", count: { $sum: 1 } } },
        ]);
        return {
            usersCount,
            adminsCount,
            coursesCount,
            completionsCount,
            certificatesCount,
            enrollmentsCount,
            coursesByDomain: coursesByDomain.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            completionsByLevel: completionsByLevel.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        };
    }
    catch (err) {
        console.error("Erreur lors de la récupération des stats globales:", err);
        throw err;
    }
};
exports.getUserStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user)
            throw new Error("Utilisateur non trouvé");
        const [enrollments, progressions, completions, certificates] = await Promise.all([
            Inscription.countDocuments({ apprenant: userId }),
            Progression.countDocuments({ apprenant: userId }),
            Progression.countDocuments({ apprenant: userId, pourcentage: 100 }),
            Certificat.countDocuments({ apprenant: userId }),
        ]);
        // Progrès moyen
        const averageProgress = await Progression.aggregate([
            { $match: { apprenant: userId } },
            { $group: { _id: null, avg: { $avg: "$pourcentage" } } },
        ]);
        return {
            user: { nom: user.nom, prenom: user.prenom, role: user.role },
            enrollments,
            progressions,
            completions,
            certificates,
            averageProgress: averageProgress[0]?.avg || 0,
        };
    }
    catch (err) {
        throw err;
    }
};
exports.getCourseStats = async (coursId) => {
    try {
        const cours = await Cours.findById(coursId);
        if (!cours)
            throw new Error("Cours non trouvé");
        const [enrollments, completions, certificates] = await Promise.all([
            Inscription.countDocuments({ cours: coursId }),
            Progression.countDocuments({ cours: coursId, pourcentage: 100 }),
            Certificat.countDocuments({ cours: coursId }),
        ]);
        return {
            cours: {
                titre: cours.titre,
                niveau: cours.niveau,
                domaine: cours.domaine,
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
// Pour tableau de bord : Liste des utilisateurs récents ou actifs
exports.getRecentUsers = async (limit = 10) => {
    return await User.find({ role: "APPRENANT" })
        .sort({ dateInscription: -1 })
        .limit(limit)
        .select("nom prenom email dateInscription");
};
// Stats avancées : Taux de complétion global
exports.getCompletionRate = async () => {
    const [totalEnrollments, totalCompletions] = await Promise.all([
        Inscription.countDocuments(),
        Progression.countDocuments({ pourcentage: 100 }),
    ]);
    return {
        rate: totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0,
    };
};
//# sourceMappingURL=StatisticsService.js.map