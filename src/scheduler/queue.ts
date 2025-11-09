
import Queue from "bull";


export const priceUpdateQueue = new Queue("price-updates", process.env.UPSTASH_REDIS_REST_URL || "redis://127.0.0.1:6379");
