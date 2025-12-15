import mongoose from "mongoose";
import { ENV } from "./env";

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(ENV.MONGO_URI);
    console.log("🍃 MongoDB Connected:", db.connection.host);
  } catch (err) {
    console.log("❌ MongoDB error:", err);
    process.exit(1);
  }
};
