"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOlderThanDays = exports.formatDate = void 0;
const moment_1 = __importDefault(require("moment"));
const formatDate = (date) => {
    return (0, moment_1.default)(date).format('YYYY-MM-DD HH:mm:ss');
};
exports.formatDate = formatDate;
const isOlderThanDays = (date, days) => {
    return (0, moment_1.default)().diff((0, moment_1.default)(date), 'days') > days;
};
exports.isOlderThanDays = isOlderThanDays;
//# sourceMappingURL=dateUtils.js.map