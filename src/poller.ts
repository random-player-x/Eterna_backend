// src/poller.ts
import { searchTokens, getTokenDetails } from "./sources/dexscreener.js";
import { normalizeTokenData } from "./normalizer.js";
import { getJupiterPrices } from "./sources/jupiter.js";
import { setTokens } from "./state.js";
import { broadcastUpdate } from "./server/wsHub.js";

export async function pollDex() {
  // 1) discover addresses via DexScreener
  const search = await searchTokens("dog");

  const addresses = (search?.pairs || [])
  .map((p: any) => p.baseToken?.address)
  .filter(Boolean)
  .filter((a: string) => !a.startsWith("0x")) // only Solana tokens
  .slice(0, 20);


  // 2) normalize Dex data for each address
  const dexTokens = [];

  for (const a of addresses) {
    const details = await getTokenDetails(a);
    const flat = normalizeTokenData(details);
    if (flat) dexTokens.push(flat);
  }

  // 3) get SOL price in USD from Jupiter
  const solMint = "So11111111111111111111111111111111111111112";
  const solPriceResponse = await getJupiterPrices([solMint]);
  const solPriceUsd = solPriceResponse[solMint]?.usdPrice || 0;
  console.log("SOL price USD:", solPriceUsd);
  // 4) get Jupiter prices for all tokens
  const jupData = await getJupiterPrices(addresses);
  // 5) merge + convert to final USD
  const merged = dexTokens.map((t) => {
    const dexUsdPrice = t.priceNative * solPriceUsd;
    const j = jupData[t.address];

    let finalPrice = dexUsdPrice;
    if (j && j.usdPrice) {
      finalPrice = (dexUsdPrice + j.usdPrice) / 2;
    //   console.log(finalPrice, dexUsdPrice, j.usdPrice);
    }

    return {
      address: t.address,
      name: t.name,
      symbol: t.symbol,
      price: finalPrice,
      volume24h: t.volume24h,
      liquidityUsd: t.liquidityUsd,
      priceChange24h: t.priceChange24h,
      dexprice: dexUsdPrice,
      jupiterPrice: j?.usdPrice || null,
    };
  });

  // 6) store in memory
  setTokens(merged);
  broadcastUpdate({type: "update", tokens: merged});
}

