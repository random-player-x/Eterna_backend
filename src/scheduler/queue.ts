
import Queue from "bull";

export const priceUpdateQueue = new Queue("price-updates", {
  redis: { host: "127.0.0.1", port: 6379 }
});
