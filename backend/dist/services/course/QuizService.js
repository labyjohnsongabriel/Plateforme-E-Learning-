"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const Quiz_1 = __importDefault(require("../../models/course/Quiz"));
// Create a new quiz
const create = async (data) => {
    const quiz = new Quiz_1.default(data);
    await quiz.save();
    return quiz;
};
exports.create = create;
//# sourceMappingURL=QuizService.js.map