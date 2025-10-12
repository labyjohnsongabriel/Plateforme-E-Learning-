import { Document, Types, Model } from 'mongoose';
import { StatutInscription } from '../../models/enums/StatutInscription';
export interface IInscription extends Document {
    apprenant: Types.ObjectId;
    cours: Types.ObjectId;
    dateInscription: Date;
    statut: StatutInscription;
}
declare const Inscription: Model<IInscription>;
export default Inscription;
//# sourceMappingURL=Inscription.d.ts.map