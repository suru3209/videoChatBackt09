"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const serverConfig_1 = require("./config/serverConfig");
const socketManager_1 = require("./controllers/socketManager");
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
(0, serverConfig_1.setupMiddleware)(app);
app.get("/", (req, res) => {
    res.json({
        name: "suru",
        username: "xyz",
        email: "suru@example.com",
        password: "12345",
    });
});
// ✅ CREATE HTTP SERVER
const server = http_1.default.createServer(app);
// ✅ ATTACH SOCKET.IO HERE
(0, socketManager_1.connectToSocket)(server);
(async () => {
    await (0, db_1.connectDB)();
    server.listen(env_1.ENV.PORT, () => {
        console.log("server is running from ", env_1.ENV.PORT);
    });
})();
//# sourceMappingURL=app.js.map