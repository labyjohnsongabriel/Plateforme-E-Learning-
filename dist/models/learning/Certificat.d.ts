import { Document, Types, Model } from 'mongoose';
export interface ICertificat extends Document {
    apprenant: Types.ObjectId;
    cours: Types.ObjectId;
    dateEmission: Date;
    urlCertificat: string;
}
declare const Certificat: Model<ICertificat>;
export default Certificat;
//# sourceMappingURL=Certificat.d.ts.map