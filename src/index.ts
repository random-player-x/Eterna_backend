// src/index.ts
import Fastify from "fastify";
import { tokensRoute } from "./routes/tokens.js";
import { searchTokens, getTokenDetails } from "./sources/dexscreener.js";
import { pollDex } from "./poller.js";
import { set } from "zod";
const app = Fastify({ logger: true });

app.get("/healthz", async () => {
  return { ok: true, ts: Date.now() };
});

app.register(tokensRoute);
app.get("/test", async()=>{
  const search = await searchTokens("dog");
  const firstAddress = search?.pairs?.[0]?.baseToken?.address;
  if (!firstAddress) return { error: "no tokens found" };

  const details = await getTokenDetails(firstAddress);
  return {firstAddress, details};

});

const PORT = Number(process.env.PORT || 8080);

app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`✅ Server running at ${addr}`);

  // start polling
  setInterval(pollDex, 10000);
});
