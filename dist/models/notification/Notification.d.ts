import { Document, Model, Types } from 'mongoose';
export declare enum NotificationType {
    RAPPEL_COURS = "RAPPEL_COURS",
    CERTIFICAT = "CERTIFICAT",
    PROGRESSION = "PROGRESSION"
}
export interface INotification extends Document {
    utilisateur: Types.ObjectId;
    message: string;
    type: NotificationType;
    dateEnvoi: Date;
    lu: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface NotificationModel extends Model<INotification> {
}
declare const _default: Model<INotification, {}, {}, {}, Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map