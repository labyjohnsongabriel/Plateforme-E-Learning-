import { Document, Types, Model } from 'mongoose';
export interface IProgression extends Document {
    apprenant: Types.ObjectId;
    cours: Types.ObjectId;
    pourcentage: number;
    dateFin?: Date;
}
declare const Progression: Model<IProgression>;
export default Progression;
//# sourceMappingURL=Progression.d.ts.map