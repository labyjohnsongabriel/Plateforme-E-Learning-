"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const Cours_1 = __importDefault(require("../../models/course/Cours"));
/**
 * Contrôleur pour gérer les statistiques des cours.
 */
class StatsController {
}
_a = StatsController;
/**
 * Récupère les statistiques globales des cours.
 * @param req - Requête Express
 * @param res - Réponse Express
 */
StatsController.getStats = async (req, res) => {
    try {
        const stats = {
            totalCourses: await Cours_1.default.countDocuments(),
            categories: await Cours_1.default.distinct('category'),
            totalEnrollments: 500, // TODO: Remplacer par une vraie requête
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error.message);
        res.status(500).json({
            message: 'Erreur serveur lors de la récupération des statistiques',
        });
    }
};
exports.default = StatsController;
//# sourceMappingURL=StatsController.js.map