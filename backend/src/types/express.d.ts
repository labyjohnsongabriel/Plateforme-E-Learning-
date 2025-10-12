// src/types/express.d.ts
import { RoleUtilisateur } from '../models/user/User';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: RoleUtilisateur;
    };
  }
}