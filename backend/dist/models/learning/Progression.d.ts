import { Document, Types, Model } from 'mongoose';
import { StatutProgression } from '../../services/learning/ProgressionService';
export interface IProgression extends Document {
    apprenant: Types.ObjectId;
    cours: Types.ObjectId;
    pourcentage: number;
    dateDebut: Date;
    dateFin?: Date;
    statut: StatutProgression;
}
declare const Progression: Model<IProgression>;
export default Progression;
//# sourceMappingURL=Progression.d.ts.map