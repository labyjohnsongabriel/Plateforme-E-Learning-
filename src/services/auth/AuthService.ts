import User, { IUser, RoleUtilisateur } from '../models/user/User';
import * as JwtService from './JwtService';
import * as PasswordService from './PasswordService';

// Interface for login input
interface LoginInput {
  email: string;
  motDePasse: string;
}

// Interface for login result
interface LoginResult {
  token: string;
  user: IUser;
}

// Register a new user
export const register = async (data: Partial<IUser>): Promise<IUser> => {
  const user = new User(data);
  await user.save();
  return user;
};

// Login a user
export const login = async ({ email, motDePasse }: LoginInput): Promise<LoginResult> => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(motDePasse))) {
    throw new Error('Invalid credentials');
  }
  const token = JwtService.sign({ id: user._id.toString(), role: user.role });
  return { token, user };
};