"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = __importDefault(require("./admin"));
const auth_1 = __importDefault(require("./auth"));
const course_1 = __importDefault(require("./course"));
const learning_1 = __importDefault(require("./learning"));
const notification_1 = __importDefault(require("./notification"));
const stats_1 = __importDefault(require("./stats"));
const router = (0, express_1.Router)();
// Utilisation correcte des variables importées
router.use('/auth', auth_1.default);
router.use('/users', admin_1.default); // 'users' géré par les routes admin
router.use('/courses', course_1.default);
router.use('/learning', learning_1.default);
router.use('/notifications', notification_1.default);
router.use('/admin', stats_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map