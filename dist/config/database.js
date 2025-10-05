"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../database/connection"); // Ajustez le chemin si nécessaire
const logger_1 = __importDefault(require("../utils/logger")); // Assurez-vous que ce fichier existe et est typé
const config = {
    connect: async () => {
        try {
            await (0, connection_1.connectDB)();
            logger_1.default.info('MongoDB connected via config/database.ts');
        }
        catch (err) {
            logger_1.default.error(`DB connection error: ${err.message}`);
            process.exit(1);
        }
    },
};
exports.default = config;
//# sourceMappingURL=database.js.map