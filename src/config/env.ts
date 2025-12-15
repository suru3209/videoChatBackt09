import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 8080,
  MONGO_URI: process.env.MONGO_URI ?? "",
};

if (!ENV.MONGO_URI) {
  console.log("❌ MONGO_URI is missing in .env");
  process.exit(1);
}
