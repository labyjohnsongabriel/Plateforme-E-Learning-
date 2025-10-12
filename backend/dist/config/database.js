"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("./config"));
const connectDB = async () => {
    const mongoURI = config_1.default.MONGO_URI;
    if (!mongoURI) {
        logger_1.default.error('❌ MONGODB_URI non définie dans les variables d’environnement');
        process.exit(1);
    }
    try {
        const conn = await mongoose_1.default.connect(mongoURI, { retryWrites: true, w: 'majority' });
        logger_1.default.info(`✅ MongoDB connecté: ${conn.connection.host}`);
    }
    catch (error) {
        logger_1.default.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = exports.connectDB;
//# sourceMappingURL=database.js.map