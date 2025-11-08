// src/index.ts
import Fastify from "fastify";
import { tokensRoute } from "./routes/tokens.js";
// import { searchTokens, getTokenDetails } from "./sources/dexscreener.js";
import { pollDex } from "./poller.js";
// import { set } from "zod";
import { initWs } from "./server/wsHub.js";

const app = Fastify({ logger: true });

app.get("/healthz", async () => {
  return { ok: true, ts: Date.now() };
});
app.get("/jup", async () => {
  const ids = "dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u,B9u8h65uM1oifqmP82VyUDb68iG2fKfZiyubmNMtu3h7"
  const url = `https://lite-api.jup.ag/price/v3?ids=${encodeURIComponent(ids)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
});

app.register(tokensRoute);

const PORT = Number(process.env.PORT || 8080);

app.listen({ port: PORT, host: "0.0.0.0" }, async (err, addr) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  // app.log.info(`✅ Server running at ${addr}`);
  console.log(`✅ Server running at ${addr}`);

  initWs(app.server);
  console.log("WS initialized");

  // start polling
  await pollDex();
  setInterval(pollDex, 10000);
});
