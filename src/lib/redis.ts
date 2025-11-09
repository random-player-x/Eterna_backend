import Redis from "ioredis";

export const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL || "redis://127.0.0.1:6379")