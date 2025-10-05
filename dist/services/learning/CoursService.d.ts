import { Types } from 'mongoose';
import { CourseDocument, CourseCreateData, CourseUpdateData } from '../../types';
export declare class CoursService {
    /**
     * Crée un nouveau cours.
     * @param data - Données du cours à créer
     * @param createurId - ID de l'utilisateur créateur (instructeur ou admin)
     * @returns Le document du cours créé
     */
    static createCourse(data: CourseCreateData, createurId: string): Promise<CourseDocument>;
    /**
     * Met à jour un cours existant.
     * @param coursId - ID du cours à mettre à jour
     * @param data - Données à mettre à jour
     * @param createurId - ID de l'utilisateur (optionnel, pour vérifier l'autorisation)
     * @returns Le document du cours mis à jour
     */
    static updateCourse(coursId: string, data: CourseUpdateData, createurId?: string): Promise<CourseDocument>;
    /**
     * Récupère tous les cours.
     * @returns Liste de tous les documents de cours
     */
    static getAllCourses(): Promise<CourseDocument[]>;
    /**
     * Supprime un cours.
     * @param coursId - ID du cours à supprimer
     */
    static deleteCourse(coursId: string): Promise<void>;
    /**
     * Ajoute un contenu à un cours.
     * @param coursId - ID du cours
     * @param contenuId - ID du contenu à ajouter
     * @param createurId - ID de l'utilisateur (pour vérifier l'autorisation)
     * @returns Le document du cours mis à jour
     */
    static addContenu(coursId: string, contenuId: Types.ObjectId, createurId: string): Promise<CourseDocument>;
    /**
     * Publie un cours.
     * @param coursId - ID du cours à publier
     * @param createurId - ID de l'utilisateur (pour vérifier l'autorisation)
     * @returns Le document du cours publié
     */
    static publishCourse(coursId: string, createurId: string): Promise<CourseDocument>;
    /**
     * Calcule la complétion moyenne d'un cours.
     * @param coursId - ID du cours
     * @returns Pourcentage moyen de complétion
     */
    static getCompletionRate(coursId: string): Promise<number>;
}
//# sourceMappingURL=CoursService.d.ts.map