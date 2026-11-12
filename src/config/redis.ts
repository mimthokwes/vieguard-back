import Redis from "ioredis";
import { env } from "./env";

let isConnected = false;
let hasLoggedError = false;

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
});

redis.on("connect", () => {
  console.log("[Redis] Connecting to Redis server...");
});

redis.on("ready", () => {
  isConnected = true;
  hasLoggedError = false;
  console.log(
    `[Redis] Connected successfully to ${env.REDIS_HOST}:${env.REDIS_PORT}`,
  );
});

redis.on("error", (err) => {
  isConnected = false;
  if (!hasLoggedError) {
    hasLoggedError = true;
    console.warn(
      `[Redis Notice] Redis is not reachable (${err.message}). Caching will gracefully fall back to database.`,
    );
  }
});

redis.on("close", () => {
  isConnected = false;
});

export const getRedisStatus = () => isConnected;
