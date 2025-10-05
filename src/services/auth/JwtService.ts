import jwt from 'jsonwebtoken';
import { RoleUtilisateur } from '../models/user/User';

// Interface for JWT payload
interface JwtPayload {
  id: string;
  role: RoleUtilisateur;
}

// JWT configuration (replace with actual values or environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1d'; // Example expiration time

// Sign a JWT token
export const sign = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify a JWT token
export const verify = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};