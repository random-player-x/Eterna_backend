import { redis } from "./lib/redis.js";

export async function setCache(key: string, value: any, ttlSeconds = 30) {
  // store JSON string + expiry
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function getCache(key: string) {
  const raw = await redis.get(key);
  if (!raw) return null;
  return JSON.parse(raw);
}
