import { Types } from 'mongoose';
import { CourseDocument, CourseCreateData, CourseUpdateData } from '../../types';
export declare class CoursService {
    /**
     * Crée un nouveau cours.
     * @param data - Données du cours à créer
     * @param createurId - ID de l'utilisateur créateur
     */
    static createCourse(data: CourseCreateData, createurId: string): Promise<CourseDocument>;
    /**
     * Met à jour un cours existant.
     * @param coursId - ID du cours à mettre à jour
     * @param data - Données à mettre à jour
     * @param createurId - ID de l'utilisateur (optionnel, pour vérifier l'autorisation)
     */
    static updateCourse(coursId: string, data: CourseUpdateData, createurId?: string): Promise<CourseDocument>;
    /**
     * Récupère tous les cours.
     */
    static getAllCourses(): Promise<CourseDocument[]>;
    /**
     * Supprime un cours.
     */
    static deleteCourse(coursId: string): Promise<void>;
    /**
     * Ajoute un contenu à un cours.
     */
    static addContenu(coursId: string, contenuId: Types.ObjectId, createurId: string): Promise<CourseDocument>;
    /**
     * Publie un cours.
     */
    static publishCourse(coursId: string, createurId: string): Promise<CourseDocument>;
    /**
     * Calcule la complétion moyenne d'un cours.
     */
    static getCompletionRate(coursId: string): Promise<number>;
}
//# sourceMappingURL=CoursService.d.ts.map