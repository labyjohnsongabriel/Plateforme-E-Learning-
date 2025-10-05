import { Types } from 'mongoose';
import { INotification } from '../../models/notification/Notification';
interface NotificationData {
    utilisateur: string | Types.ObjectId;
    message: string;
    type: string;
    lu?: boolean;
    dateEnvoi?: Date;
}
export declare const create: (data: NotificationData) => Promise<INotification>;
export declare const getForUser: (userId: string | Types.ObjectId) => Promise<INotification[]>;
export declare const markAsRead: (id: string | Types.ObjectId, userId: string | Types.ObjectId) => Promise<INotification>;
export declare const deleteNotification: (id: string | Types.ObjectId, userId: string | Types.ObjectId) => Promise<INotification>;
export declare const createBatch: (data: Omit<NotificationData, "utilisateur">, utilisateurIds: (string | Types.ObjectId)[]) => Promise<INotification[]>;
export declare const envoyer: (notificationId: string | Types.ObjectId) => Promise<INotification>;
export {};
//# sourceMappingURL=NotificationService.d.ts.map