"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/jobs/fileCleanupJob.ts
const node_cron_1 = __importDefault(require("node-cron"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dateUtils = __importStar(require("../utils/dateUtils"));
const constants = __importStar(require("../utils/constants"));
const logger_1 = __importDefault(require("../utils/logger"));
// Monthly cleanup of old uploaded files
node_cron_1.default.schedule('0 0 1 * *', () => {
    const folders = ['videos', 'documents', 'images', 'certificates'];
    folders.forEach((folder) => {
        const dir = path_1.default.join(__dirname, '../../uploads', folder);
        if (!fs_1.default.existsSync(dir))
            return;
        fs_1.default.readdir(dir, (err, files) => {
            if (err)
                return logger_1.default.error(`Cleanup error: ${err.message}`);
            files.forEach((file) => {
                const filePath = path_1.default.join(dir, file);
                fs_1.default.stat(filePath, (err, stat) => {
                    if (err)
                        return;
                    if (dateUtils.isOlderThanDays(stat.mtime, constants.FILE_CLEANUP_DAYS)) {
                        fs_1.default.unlink(filePath, (err) => {
                            if (err)
                                logger_1.default.error(`File delete error: ${err.message}`);
                            else
                                logger_1.default.info(`Cleaned up file: ${filePath}`);
                        });
                    }
                });
            });
        });
    });
});
//# sourceMappingURL=cleanupJob.js.map