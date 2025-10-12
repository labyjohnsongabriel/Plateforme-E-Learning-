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
exports.getInstructeurCoursesInProgress = exports.submitCourseForApproval = exports.updateInstructeurCourse = exports.createInstructeurCourse = exports.getInstructeurCourses = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const User_1 = __importDefault(require("../../models/user/User"));
const CoursService = __importStar(require("../../services/learning/CoursService"));
// Get instructor's created courses
const getInstructeurCourses = async (instructeurId) => {
    const instructeur = await User_1.default.findById(instructeurId).populate('coursCrees');
    if (!instructeur) {
        throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
    }
    return instructeur.coursCrees || [];
};
exports.getInstructeurCourses = getInstructeurCourses;
// Create a course for instructor
const createInstructeurCourse = async (instructeurId, data) => {
    const cours = await CoursService.createCourse(data, instructeurId);
    const instructeur = await User_1.default.findById(instructeurId);
    if (!instructeur) {
        throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
    }
    instructeur.coursEnCoursEdition.push(cours._id);
    await instructeur.save();
    return cours;
};
exports.createInstructeurCourse = createInstructeurCourse;
// Update an instructor's course
const updateInstructeurCourse = async (instructeurId, coursId, data) => {
    const instructeur = await User_1.default.findById(instructeurId);
    if (!instructeur) {
        throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
    }
    if (!instructeur.coursCrees.includes(coursId) && !instructeur.coursEnCoursEdition.includes(coursId)) {
        throw (0, http_errors_1.default)(403, 'Non autorisé à modifier ce cours');
    }
    return await CoursService.updateCourse(coursId, data);
};
exports.updateInstructeurCourse = updateInstructeurCourse;
// Submit a course for approval
const submitCourseForApproval = async (instructeurId, coursId) => {
    const instructeur = await User_1.default.findById(instructeurId);
    if (!instructeur) {
        throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
    }
    const courseIndex = instructeur.coursEnCoursEdition.indexOf(coursId);
    if (courseIndex === -1) {
        throw (0, http_errors_1.default)(400, 'Cours non en cours d\'édition');
    }
    instructeur.coursEnCoursEdition.splice(courseIndex, 1);
    instructeur.coursCrees.push(coursId);
    await instructeur.save();
    return await CoursService.updateCourse(coursId, { statutApprobation: 'PENDING' });
};
exports.submitCourseForApproval = submitCourseForApproval;
// Get instructor's courses in progress
const getInstructeurCoursesInProgress = async (instructeurId) => {
    const instructeur = await User_1.default.findById(instructeurId).populate('coursEnCoursEdition');
    if (!instructeur) {
        throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
    }
    return instructeur.coursEnCoursEdition || [];
};
exports.getInstructeurCoursesInProgress = getInstructeurCoursesInProgress;
//# sourceMappingURL=InstructeurService.js.map