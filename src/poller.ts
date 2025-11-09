// src/poller.ts
import { getLatestTokens, getTokenDetails } from "./sources/dexscreener.js";
import { normalizeTokenData } from "./normalizer.js";
import { getJupiterPrices } from "./sources/jupiter.js";
import { setTokens } from "./state.js";
import { broadcastUpdate } from "./server/wsHub.js";
import { mergeTokens } from "./merge.js";
import { setCache } from "./cache.js";

export async function pollDex() {
  // 1) discover addresses via DexScreener
  const tokens = await getLatestTokens()

  const addresses = (tokens)
  .map((p: any) => p.tokenAddress)
  .filter(Boolean)
  .slice(0, 30);

  const jupData = await getJupiterPrices(addresses);
//   console.log(jupData);

  // 2) normalize Dex data for each address
  const dexTokens = [];
  for (const a of addresses) {
    const details = await getTokenDetails(a);
    const flat = normalizeTokenData(details);
    // console.log(flat);
    if (flat) dexTokens.push(flat);
  }
  // 3) get SOL price in USD from Jupiter
  const solMint = "So11111111111111111111111111111111111111112";
  const solPriceResponse = await getJupiterPrices([solMint]);
  const solPriceUsd = solPriceResponse[solMint]?.usdPrice || 0;
  const merged = mergeTokens(dexTokens, jupData, solPriceUsd);

  // 6) store in memory
  setTokens(merged);
  broadcastUpdate({type: "update", tokens: merged});
  setCache("tokens", merged, 30);
}

