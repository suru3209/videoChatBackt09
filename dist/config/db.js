"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    try {
        const db = await mongoose_1.default.connect(env_1.ENV.MONGO_URI);
        console.log("🍃 MongoDB Connected:", db.connection.host);
    }
    catch (err) {
        console.log("❌ MongoDB error:", err);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map