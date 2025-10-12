"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursService = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const Cours_1 = __importDefault(require("../../models/course/Cours"));
const CertificationService_1 = require("./CertificationService"); // Import de l'énumération
class CoursService {
    /**
     * Crée un nouveau cours.
     * @param data - Données du cours à créer
     * @param createurId - ID de l'utilisateur créateur
     */
    static async createCourse(data, createurId) {
        try {
            if (!data.titre || !data.duree || !data.domaineId || !data.niveau) {
                throw (0, http_errors_1.default)(400, 'Les champs titre, duree, domaineId et niveau sont requis');
            }
            // Validation du niveau
            if (!Object.values(CertificationService_1.NiveauFormation).includes(data.niveau)) {
                throw (0, http_errors_1.default)(400, `Niveau invalide. Valeurs acceptées: ${Object.values(CertificationService_1.NiveauFormation).join(', ')}`);
            }
            const course = new Cours_1.default({
                titre: data.titre,
                description: data.description ?? '',
                duree: data.duree,
                domaineId: data.domaineId,
                niveau: data.niveau, // Conversion de type
                createur: createurId,
                contenu: data.contenu ?? [],
                quizzes: data.quizzes ?? [],
                estPublie: data.estPublie ?? false,
                statutApprobation: data.statutApprobation ?? 'PENDING',
                createdAt: new Date(),
            });
            return await course.save();
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de la création du cours: ${err.message}`);
        }
    }
    /**
     * Met à jour un cours existant.
     * @param coursId - ID du cours à mettre à jour
     * @param data - Données à mettre à jour
     * @param createurId - ID de l'utilisateur (optionnel, pour vérifier l'autorisation)
     */
    static async updateCourse(coursId, data, createurId) {
        try {
            const course = await Cours_1.default.findById(coursId);
            if (!course)
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            if (createurId && course.createur.toString() !== createurId) {
                throw (0, http_errors_1.default)(403, 'Non autorisé à modifier ce cours');
            }
            if (data.titre !== undefined)
                course.titre = data.titre;
            if (data.description !== undefined)
                course.description = data.description;
            if (data.duree !== undefined)
                course.duree = data.duree;
            if (data.domaineId !== undefined)
                course.domaineId = data.domaineId;
            // CORRECTION : Validation et conversion du niveau
            if (data.niveau !== undefined) {
                if (!Object.values(CertificationService_1.NiveauFormation).includes(data.niveau)) {
                    throw (0, http_errors_1.default)(400, `Niveau invalide. Valeurs acceptées: ${Object.values(CertificationService_1.NiveauFormation).join(', ')}`);
                }
                course.niveau = data.niveau;
            }
            if (data.contenu !== undefined)
                course.contenu = data.contenu;
            if (data.quizzes !== undefined)
                course.quizzes = data.quizzes;
            if (data.estPublie !== undefined)
                course.estPublie = data.estPublie;
            if (data.statutApprobation !== undefined)
                course.statutApprobation = data.statutApprobation;
            return await course.save();
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de la mise à jour du cours: ${err.message}`);
        }
    }
    /**
     * Récupère tous les cours.
     */
    static async getAllCourses() {
        try {
            return await Cours_1.default.find({})
                .populate('createur', 'id role')
                .populate('domaineId', 'nom')
                .populate('contenu quizzes');
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de la récupération des cours: ${err.message}`);
        }
    }
    /**
     * Supprime un cours.
     */
    static async deleteCourse(coursId) {
        try {
            const course = await Cours_1.default.findByIdAndDelete(coursId);
            if (!course)
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de la suppression du cours: ${err.message}`);
        }
    }
    /**
     * Ajoute un contenu à un cours.
     */
    static async addContenu(coursId, contenuId, createurId) {
        try {
            const course = await Cours_1.default.findById(coursId);
            if (!course)
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            if (course.createur.toString() !== createurId)
                throw (0, http_errors_1.default)(403, 'Non autorisé à modifier ce cours');
            course.contenu = course.contenu ?? [];
            course.contenu.push(contenuId);
            return await course.save();
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de l'ajout du contenu: ${err.message}`);
        }
    }
    /**
     * Publie un cours.
     */
    static async publishCourse(coursId, createurId) {
        try {
            const course = await Cours_1.default.findById(coursId);
            if (!course)
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            if (course.createur.toString() !== createurId)
                throw (0, http_errors_1.default)(403, 'Non autorisé à publier ce cours');
            course.estPublie = true;
            return await course.save();
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de la publication du cours: ${err.message}`);
        }
    }
    /**
     * Calcule la complétion moyenne d'un cours.
     */
    static async getCompletionRate(coursId) {
        try {
            const course = await Cours_1.default.findById(coursId);
            if (!course)
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            // Exemple de calcul simple basé sur la progression
            return 0; // Tu peux remplacer par le calcul réel avec ProgressionModel
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors du calcul de la complétion: ${err.message}`);
        }
    }
}
exports.CoursService = CoursService;
//# sourceMappingURL=CoursService.js.map