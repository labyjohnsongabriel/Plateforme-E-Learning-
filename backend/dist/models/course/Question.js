"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const questionSchema = new mongoose_1.Schema({
    texte: { type: String, required: true },
    type: {
        type: String,
        enum: ['SINGLE', 'MULTIPLE'],
        required: true,
    },
    options: [{ type: String, required: true }],
    reponsesCorrectes: [{ type: String, required: true }],
    quiz: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', required: true }, // ✅ corrigé ici
}, { timestamps: true });
const Question = (0, mongoose_1.model)('Question', questionSchema);
exports.default = Question;
//# sourceMappingURL=Question.js.map