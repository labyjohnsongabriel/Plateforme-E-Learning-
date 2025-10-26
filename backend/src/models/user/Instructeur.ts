import { Schema, Types, Model } from 'mongoose';
import User, { IUser } from './User';

interface IInstructeur extends IUser {
  coursCrees: Types.ObjectId[];
  coursEnCoursEdition: Types.ObjectId[];
  statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
  biographie?: string;
  createdAt: Date;
  updatedAt: Date;
}

const instructeurSchema = new Schema<IInstructeur>(
  {
    coursCrees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Cours',
        required: true,
      },
    ],
    coursEnCoursEdition: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Cours',
      },
    ],
    statutApprobation: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    biographie: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

instructeurSchema.index({ coursCrees: 1 }, { unique: false, partialFilterExpression: { coursCrees: { $exists: true } } });

instructeurSchema.pre('find', function (this: any, next) {
  this.populate('coursCrees coursEnCoursEdition');
  next();
});

export default User.discriminator('Instructeur', instructeurSchema);