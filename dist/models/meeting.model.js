"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meeting = void 0;
const mongoose_1 = require("mongoose");
const MeetingSchema = new mongoose_1.Schema({
    user_id: { type: String, required: true },
    meeting_code: { type: String, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });
exports.Meeting = (0, mongoose_1.model)("Meeting", MeetingSchema);
//# sourceMappingURL=meeting.model.js.map