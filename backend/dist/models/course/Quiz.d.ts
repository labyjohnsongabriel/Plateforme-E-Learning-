import { Document, Types, Model } from 'mongoose';
interface IQuiz extends Document {
    titre: string;
    description?: string;
    cours: Types.ObjectId;
    questions: Types.ObjectId[];
    scoreMinValide: number;
    createdAt: Date;
    updatedAt: Date;
    corriger(reponsesUtilisateur: number[]): Promise<{
        score: number;
        valide: boolean;
    }>;
}
declare const Quiz: Model<IQuiz>;
export default Quiz;
//# sourceMappingURL=Quiz.d.ts.map