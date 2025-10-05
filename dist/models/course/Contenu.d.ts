import { Document, Types, Model } from 'mongoose';
interface IContenu extends Document {
    titre: string;
    description?: string;
    url: string;
    duree?: number;
    cours: Types.ObjectId;
    type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
    createdAt: Date;
    updatedAt: Date;
    visualiser(utilisateurId: Types.ObjectId): Promise<{
        message: string;
    }>;
}
declare const Contenu: Model<IContenu>;
export default Contenu;
//# sourceMappingURL=Contenu.d.ts.map