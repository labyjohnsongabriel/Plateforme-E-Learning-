"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursService = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const Cours_1 = __importDefault(require("../../models/learning/Cours"));
class CoursService {
    /**
     * Crée un nouveau cours.
     * @param data - Données du cours à créer
     * @param createurId - ID de l'utilisateur créateur (instructeur ou admin)
     * @returns Le document du cours créé
     */
    static async createCourse(data, createurId) {
        try {
            // Validation des champs requis
            if (!data.titre || !data.duree || !data.domaineId || !data.niveau) {
                throw (0, http_errors_1.default)(400, 'Les champs titre, duree, domaineId et niveau sont requis');
            }
            const course = new Cours_1.default({
                titre: data.titre,
                description: data.description ?? '',
                duree: data.duree,
                domaineId: data.domaineId,
                niveau: data.niveau,
                createur: createurId,
                contenus: data.contenus ?? [],
                quizzes: data.quizzes ?? [],
                estPublie: data.estPublie ?? false,
                datePublication: data.estPublie ? new Date() : undefined,
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
     * @returns Le document du cours mis à jour
     */
    static async updateCourse(coursId, data, createurId) {
        try {
            const course = await Cours_1.default.findById(coursId);
            if (!course) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            if (createurId && course.createur.toString() !== createurId) {
                throw (0, http_errors_1.default)(403, 'Non autorisé à modifier ce cours');
            }
            // Construire les données de mise à jour
            const updateData = {};
            if (data.titre !== undefined)
                updateData.titre = data.titre;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.duree !== undefined)
                updateData.duree = data.duree;
            if (data.domaineId !== undefined)
                updateData.domaineId = data.domaineId;
            if (data.niveau !== undefined)
                updateData.niveau = data.niveau;
            if (data.contenus !== undefined)
                updateData.contenus = data.contenus;
            if (data.quizzes !== undefined)
                updateData.quizzes = data.quizzes;
            if (data.estPublie !== undefined)
                updateData.estPublie = data.estPublie;
            if (data.datePublication !== undefined)
                updateData.datePublication = data.datePublication;
            if (data.statutApprobation !== undefined)
                updateData.statutApprobation = data.statutApprobation;
            Object.assign(course, updateData);
            return await course.save();
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de la mise à jour du cours: ${err.message}`);
        }
    }
    /**
     * Récupère tous les cours.
     * @returns Liste de tous les documents de cours
     */
    static async getAllCourses() {
        try {
            return await Cours_1.default.find({})
                .populate('createur', 'id role')
                .populate('domaineId', 'nom')
                .populate('contenus quizzes');
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de la récupération des cours: ${err.message}`);
        }
    }
    /**
     * Supprime un cours.
     * @param coursId - ID du cours à supprimer
     */
    static async deleteCourse(coursId) {
        try {
            const course = await Cours_1.default.findByIdAndDelete(coursId);
            if (!course) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de la suppression du cours: ${err.message}`);
        }
    }
    /**
     * Ajoute un contenu à un cours.
     * @param coursId - ID du cours
     * @param contenuId - ID du contenu à ajouter
     * @param createurId - ID de l'utilisateur (pour vérifier l'autorisation)
     * @returns Le document du cours mis à jour
     */
    static async addContenu(coursId, contenuId, createurId) {
        try {
            const course = await Cours_1.default.findById(coursId);
            if (!course) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            if (course.createur.toString() !== createurId) {
                throw (0, http_errors_1.default)(403, 'Non autorisé à modifier ce cours');
            }
            return await course.ajouterContenu(contenuId);
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de l'ajout du contenu: ${err.message}`);
        }
    }
    /**
     * Publie un cours.
     * @param coursId - ID du cours à publier
     * @param createurId - ID de l'utilisateur (pour vérifier l'autorisation)
     * @returns Le document du cours publié
     */
    static async publishCourse(coursId, createurId) {
        try {
            const course = await Cours_1.default.findById(coursId);
            if (!course) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            if (course.createur.toString() !== createurId) {
                throw (0, http_errors_1.default)(403, 'Non autorisé à publier ce cours');
            }
            return await course.publier();
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors de la publication du cours: ${err.message}`);
        }
    }
    /**
     * Calcule la complétion moyenne d'un cours.
     * @param coursId - ID du cours
     * @returns Pourcentage moyen de complétion
     */
    static async getCompletionRate(coursId) {
        try {
            const course = await Cours_1.default.findById(coursId);
            if (!course) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            return await course.calculerCompletionMoyenne();
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, `Erreur lors du calcul de la complétion: ${err.message}`);
        }
    }
}
exports.CoursService = CoursService;
//# sourceMappingURL=CoursService.js.map