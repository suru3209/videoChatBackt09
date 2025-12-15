"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToSocket = void 0;
const socket_io_1 = require("socket.io");
/* ---------------- Memory Stores ---------------- */
const connections = {};
const messages = {};
const timeOnline = {};
/* ---------------- Main Socket Function ---------------- */
const connectToSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        /* ---------- JOIN CALL ---------- */
        socket.on("join-call", (roomId) => {
            if (!connections[roomId]) {
                connections[roomId] = [];
            }
            connections[roomId].push(socket.id);
            timeOnline[socket.id] = new Date();
            // Notify all users in room
            connections[roomId].forEach((id) => {
                io.to(id).emit("user-joined", socket.id, connections[roomId]);
            });
            // Send previous messages to new user
            if (messages[roomId]) {
                messages[roomId].forEach((msg) => {
                    io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg.socketIdSender);
                });
            }
        });
        /* ---------- WEBRTC SIGNAL ---------- */
        socket.on("signal", (targetId, message) => {
            io.to(targetId).emit("signal", socket.id, message);
        });
        /* ---------- CHAT MESSAGE ---------- */
        socket.on("chat-message", (data, sender) => {
            let roomFound = "";
            for (const [roomId, socketList] of Object.entries(connections)) {
                if (socketList.includes(socket.id)) {
                    roomFound = roomId;
                    break;
                }
            }
            if (!roomFound)
                return;
            if (!messages[roomFound]) {
                messages[roomFound] = [];
            }
            messages[roomFound].push({
                sender,
                data,
                socketIdSender: socket.id,
            });
            console.log("💬", roomFound, sender, data);
            connections[roomFound].forEach((id) => {
                io.to(id).emit("chat-message", data, sender, socket.id);
            });
        });
        /* ---------- DISCONNECT ---------- */
        socket.on("disconnect", () => {
            for (const [roomId, socketList] of Object.entries(connections)) {
                if (socketList.includes(socket.id)) {
                    // notify others
                    socketList.forEach((id) => {
                        io.to(id).emit("user-left", socket.id);
                    });
                    // remove socket
                    connections[roomId] = socketList.filter((id) => id !== socket.id);
                    if (connections[roomId].length === 0) {
                        delete connections[roomId];
                    }
                    break;
                }
            }
            delete timeOnline[socket.id];
        });
    });
    return io;
};
exports.connectToSocket = connectToSocket;
//# sourceMappingURL=socketManager.js.map