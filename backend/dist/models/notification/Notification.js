"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/notification/Notification.js
const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ["RAPPEL_COURS", "CERTIFICAT", "PROGRESSION"],
        required: true,
    },
    dateEnvoi: { type: Date, default: Date.now },
    lu: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model("Notification", notificationSchema);
//# sourceMappingURL=Notification.js.map