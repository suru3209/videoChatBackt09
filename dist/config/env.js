"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 8080,
    MONGO_URI: process.env.MONGO_URI ?? "",
};
if (!exports.ENV.MONGO_URI) {
    console.log("❌ MONGO_URI is missing in .env");
    process.exit(1);
}
//# sourceMappingURL=env.js.map