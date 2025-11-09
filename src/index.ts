// src/index.ts
import Fastify from "fastify";
import { tokensRoute } from "./routes/tokens.js";
import { pollDex } from "./poller.js";
import { initWs } from "./server/wsHub.js";
import { startScheduler } from "./scheduler/scheduler.js";

const app = Fastify({ logger: true });

app.get("/healthz", async () => {
  return { ok: true, ts: Date.now() };
});

app.register(tokensRoute);

const PORT = Number(process.env.PORT || 8080);

app.listen({ port: PORT, host: "0.0.0.0" }, async (err, addr) => {
  if (err) throw err;

  await app.ready(); // MUST

  initWs(app.server);
  console.log("WS READY");

  // await pollDex();
  // setInterval(pollDex, 10000);
  startScheduler();
});




