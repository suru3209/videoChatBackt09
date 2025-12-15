import cors from "cors";
import express, { Application } from "express";
import router from "../routes/user.routes";

export const setupMiddleware = (app: Application) => {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/v1/users", router);
};
