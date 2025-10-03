"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const dateUtils = require("../utils/dateUtils");
const constants = require("../utils/constants");
const logger = require("../utils/logger");
// Monthly cleanup of old uploaded files
cron.schedule("0 0 1 * *", () => {
    const folders = ["videos", "documents", "images", "certificates"];
    folders.forEach((folder) => {
        const dir = path.join(__dirname, "../../uploads", folder);
        if (!fs.existsSync(dir))
            return;
        fs.readdir(dir, (err, files) => {
            if (err)
                return logger.error(`Cleanup error: ${err.message}`);
            files.forEach((file) => {
                const filePath = path.join(dir, file);
                fs.stat(filePath, (err, stat) => {
                    if (err)
                        return;
                    if (dateUtils.isOlderThanDays(stat.mtime, constants.FILE_CLEANUP_DAYS)) {
                        fs.unlink(filePath, (err) => {
                            if (err)
                                logger.error(`File delete error: ${err.message}`);
                            else
                                logger.info(`Cleaned up file: ${filePath}`);
                        });
                    }
                });
            });
        });
    });
});
//# sourceMappingURL=cleanupJob.js.map