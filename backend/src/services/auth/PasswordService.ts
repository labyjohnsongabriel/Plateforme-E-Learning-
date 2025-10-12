import bcrypt from 'bcrypt';

// Hash a password
export const hash = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// Compare a password with a hash
export const compare = async (candidate: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(candidate, hash);
};
