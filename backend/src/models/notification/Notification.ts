import { Schema, Document, Model, Types, model } from 'mongoose';

// Enum for notification types
export enum NotificationType {
  RAPPEL_COURS = 'RAPPEL_COURS',
  CERTIFICAT = 'CERTIFICAT',
  PROGRESSION = 'PROGRESSION',
}

// Interface for Notification document
export interface INotification extends Document {
  utilisateur: Types.ObjectId;
  message: string;
  type: NotificationType;
  dateEnvoi: Date;
  lu: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Notification model
export interface NotificationModel extends Model<INotification> {}

// Define the schema
const notificationSchema = new Schema<INotification>(
  {
    utilisateur: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    dateEnvoi: { type: Date, default: Date.now },
    lu: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Export the model
export default model<INotification>('Notification', notificationSchema);