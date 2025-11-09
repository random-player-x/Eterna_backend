
export function mergeTokens(dexTokens: any[], jupData: any, solPriceUsd: number) {
    return dexTokens.map((t) => {
      const dexUsdPrice = t.priceNative * solPriceUsd;
      const j = jupData[t.address];
  
      let finalPrice = dexUsdPrice;
      if (j && j.usdPrice) {
        finalPrice = (dexUsdPrice + j.usdPrice) / 2;
      }
  
      return {
        dexId: t.dexId,
        address: t.address,
        name: t.name,
        symbol: t.symbol,
        priceUsd: finalPrice,
        volume24h: t.volume24h,
        liquidityUsd: t.liquidityUsd,
        priceChange1h: t.priceChange1h,
        priceChange6h: t.priceChange6h,
        priceChange24h: t.priceChange24h,
        marketCapUsd: t.marketCapUsd,
        jupiterPriceUsd: j?.usdPrice || null,
        dexPriceUsd: dexUsdPrice,
      };
    });
  }
  