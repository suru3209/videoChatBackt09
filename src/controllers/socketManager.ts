import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

/* ---------------- Types ---------------- */

type RoomId = string;
type SocketId = string;

interface Message {
  sender: string;
  data: string;
  socketIdSender: SocketId;
}

/* ---------------- Memory Stores ---------------- */

const connections: Record<RoomId, SocketId[]> = {};
const messages: Record<RoomId, Message[]> = {};
const timeOnline: Record<SocketId, Date> = {};

/* ---------------- Main Socket Function ---------------- */

export const connectToSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    /* ---------- JOIN CALL ---------- */
    socket.on("join-call", (roomId: string) => {
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
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg.socketIdSender
          );
        });
      }
    });

    /* ---------- WEBRTC SIGNAL ---------- */
    socket.on("signal", (targetId: string, message: string) => {
      io.to(targetId).emit("signal", socket.id, message);
    });

    /* ---------- CHAT MESSAGE ---------- */
    socket.on("chat-message", (data: string, sender: string) => {
      let roomFound = "";

      for (const [roomId, socketList] of Object.entries(connections)) {
        if (socketList.includes(socket.id)) {
          roomFound = roomId;
          break;
        }
      }

      if (!roomFound) return;

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
