import jwt from 'jsonwebtoken';

interface JwtConfig {
  secret: string | undefined;
  sign: (payload: { [key: string]: any }) => string;
  verify: (token: string) => any;
}

const config: JwtConfig = {
  secret: process.env.JWT_SECRET,
  sign: (payload: { [key: string]: any }) => jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' }),
  verify: (token: string) => jwt.verify(token, process.env.JWT_SECRET || 'secret'),
};

export default config;