"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
const admin_1 = __importDefault(require("./admin"));
const auth_1 = __importDefault(require("./auth"));
const courses_1 = __importDefault(require("./courses"));
const learning_1 = __importDefault(require("./learning"));
const notifications_1 = __importDefault(require("./notifications"));
const stats_1 = __importDefault(require("./stats"));
const router = (0, express_1.Router)();
// Vérification que chaque route est bien définie
console.log('Routes chargées:');
console.log('authRoutes:', typeof auth_1.default);
console.log('adminRoutes:', typeof admin_1.default);
console.log('courseRoutes:', typeof courses_1.default);
console.log('learningRoutes:', typeof learning_1.default);
console.log('notificationRoutes:', typeof notifications_1.default);
console.log('statsRoutes:', typeof stats_1.default);
// Utilisation des routes avec vérification
if (typeof auth_1.default === 'function') {
    router.use('/auth', auth_1.default);
}
else {
    console.error('❌ authRoutes n\'est pas une fonction valide');
}
if (typeof admin_1.default === 'function') {
    router.use('/users', admin_1.default);
}
else {
    console.error('❌ adminRoutes n\'est pas une fonction valide');
}
if (typeof courses_1.default === 'function') {
    router.use('/courses', courses_1.default);
}
else {
    console.error('❌ courseRoutes n\'est pas une fonction valide');
}
if (typeof learning_1.default === 'function') {
    router.use('/learning', learning_1.default);
}
else {
    console.error('❌ learningRoutes n\'est pas une fonction valide');
}
if (typeof notifications_1.default === 'function') {
    router.use('/notifications', notifications_1.default);
}
else {
    console.error('❌ notificationRoutes n\'est pas une fonction valide');
}
if (typeof stats_1.default === 'function') {
    router.use('/admin', stats_1.default);
}
else {
    console.error('❌ statsRoutes n\'est pas une fonction valide');
}
exports.default = router;
//# sourceMappingURL=index.js.map