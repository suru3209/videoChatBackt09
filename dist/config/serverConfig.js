"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const setupMiddleware = (app) => {
    app.use((0, cors_1.default)({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "100kb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use("/api/v1/users", user_routes_1.default);
};
exports.setupMiddleware = setupMiddleware;
//# sourceMappingURL=serverConfig.js.map