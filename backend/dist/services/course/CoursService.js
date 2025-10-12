"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.getAllCourses = exports.createCourse = void 0;
const Cours_1 = __importDefault(require("../../models/learning/Cours"));
// Create a new course
const createCourse = async (data, createurId) => {
    const course = new Cours_1.default({ ...data, createur: createurId });
    await course.save();
    return course;
};
exports.createCourse = createCourse;
// Get all courses with creator details
const getAllCourses = async () => {
    return await Cours_1.default.find().populate('createur', 'nom prenom');
};
exports.getAllCourses = getAllCourses;
// Update a course
const updateCourse = async (coursId, data) => {
    return await Cours_1.default.findByIdAndUpdate(coursId, data, { new: true });
};
exports.updateCourse = updateCourse;
// Delete a course
const deleteCourse = async (coursId) => {
    await Cours_1.default.findByIdAndDelete(coursId);
    // TODO: Optionally delete associated progressions and certificates
};
exports.deleteCourse = deleteCourse;
//# sourceMappingURL=CoursService.js.map