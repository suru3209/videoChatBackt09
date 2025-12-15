import express, { Application, Request, Response } from "express";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";
import { setupMiddleware } from "./config/serverConfig";
import { connectToSocket } from "./controllers/socketManager";
import http from "http";

const app: Application = express();

setupMiddleware(app);



app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "suru",
    username: "xyz",
    email: "suru@example.com",
    password: "12345",
  });
});

// ✅ CREATE HTTP SERVER
const server = http.createServer(app);

// ✅ ATTACH SOCKET.IO HERE
connectToSocket(server);

(async () => {
  await connectDB();

  server.listen(ENV.PORT, () => {
    console.log("server is running from ", ENV.PORT);
  });
})();
