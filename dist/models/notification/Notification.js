"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = void 0;
const mongoose_1 = require("mongoose");
// Enum for notification types
var NotificationType;
(function (NotificationType) {
    NotificationType["RAPPEL_COURS"] = "RAPPEL_COURS";
    NotificationType["CERTIFICAT"] = "CERTIFICAT";
    NotificationType["PROGRESSION"] = "PROGRESSION";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// Define the schema
const notificationSchema = new mongoose_1.Schema({
    utilisateur: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true,
    },
    dateEnvoi: { type: Date, default: Date.now },
    lu: { type: Boolean, default: false },
}, { timestamps: true });
// Export the model
exports.default = (0, mongoose_1.model)('Notification', notificationSchema);
//# sourceMappingURL=Notification.js.map