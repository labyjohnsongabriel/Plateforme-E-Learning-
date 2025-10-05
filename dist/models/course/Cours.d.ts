import { Document, Types, Model } from 'mongoose';
interface ICours extends Document {
    titre: string;
    description: string;
    duree: number;
    domaineId: Types.ObjectId;
    niveau: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
    createur: Types.ObjectId;
    contenus: Types.ObjectId[];
    quizzes: Types.ObjectId[];
    datePublication?: Date;
    estPublie: boolean;
    createdAt: Date;
    updatedAt: Date;
    statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
    ajouterContenu(contenuId: Types.ObjectId): Promise<ICours>;
    publier(): Promise<ICours>;
    calculerCompletionMoyenne(): Promise<number>;
}
declare const Cours: Model<ICours>;
export default Cours;
//# sourceMappingURL=Cours.d.ts.map