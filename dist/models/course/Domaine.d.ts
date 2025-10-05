import { Document, Types, Model } from 'mongoose';
interface IDomaine extends Document {
    nom: 'Informatique' | 'Communication' | 'Multimedia';
    description?: string;
    cours: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    ajouterCours(coursId: Types.ObjectId): Promise<IDomaine>;
    getStatistiques(): Promise<{
        nombreCours: number;
        dureeTotale: number;
    }>;
}
declare const Domaine: Model<IDomaine>;
export default Domaine;
//# sourceMappingURL=Domaine.d.ts.map