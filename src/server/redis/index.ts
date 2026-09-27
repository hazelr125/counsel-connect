import "dotenv/config";
import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set — see .env.example");
}

export const redis = new Redis(process.env.REDIS_URL);