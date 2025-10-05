import { Types } from 'mongoose';
import { IUser } from '../../models/user/User';
export declare const getAllUsers: () => Promise<Partial<IUser>[]>;
export declare const updateUser: (userId: string | Types.ObjectId, data: Partial<IUser>) => Promise<IUser | null>;
export declare const deleteUser: (userId: string | Types.ObjectId) => Promise<void>;
//# sourceMappingURL=UserService.d.ts.map