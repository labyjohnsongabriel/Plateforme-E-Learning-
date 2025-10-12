"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.sign = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// JWT configuration (replace with actual values or environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1d'; // Example expiration time
// Sign a JWT token
const sign = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
exports.sign = sign;
// Verify a JWT token
const verify = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verify = verify;
//# sourceMappingURL=JwtService.js.map