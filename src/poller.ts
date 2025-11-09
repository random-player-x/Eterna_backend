// src/poller.ts
import { searchTokens, getTokenDetails } from "./sources/dexscreener.js";
import { normalizeTokenData } from "./normalizer.js";
import { getJupiterPrices } from "./sources/jupiter.js";
import { setTokens } from "./state.js";
import { broadcastUpdate } from "./server/wsHub.js";
import { mergeTokens } from "./merge.js";

export async function pollDex() {
  // 1) discover addresses via DexScreener
  const tokens = await searchTokens("dog");

  const addresses = (tokens?.pairs || [])
  .map((p: any) => p.baseToken?.address)
  .filter(Boolean)
  .slice(0, 30);

  // 2) normalize Dex data for each address
  const dexTokens = [];
  for (const a of addresses) {
    const details = await getTokenDetails(a);
    const flat = normalizeTokenData(details);
    if (flat) dexTokens.push(flat);
  }

  const jupData = await getJupiterPrices(addresses);
  // 3) get SOL price in USD from Jupiter
  const solMint = "So11111111111111111111111111111111111111112";
  const solPriceResponse = await getJupiterPrices([solMint]);
  const solPriceUsd = solPriceResponse[solMint]?.usdPrice || 0;
  const merged = mergeTokens(dexTokens, jupData, solPriceUsd);

  // 6) store in memory
  setTokens(merged);
  broadcastUpdate({type: "update", tokens: merged});
}

