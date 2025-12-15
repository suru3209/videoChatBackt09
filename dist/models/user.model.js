"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "male",
    },
    token: { type: String },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", UserSchema);
//# sourceMappingURL=user.model.js.map