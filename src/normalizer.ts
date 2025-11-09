export function normalizeTokenData(tokenData: any) {
    const pairs = tokenData?.pairs || [];
    
    const best = pairs.sort((a: any, b: any) => {
        const volumeA = a?.volumeUSD24h || 0;
        const volumeB = b?.volumeUSD24h || 0;
        // FIX: Ensure this is descending (B - A)
        return volumeB - volumeA;
    }
    )[0];
    
    // Return default values if no best pair is found (e.g., empty pairs array)
    if (!best) {
      return {
        dexId: null,
        address: null,
        name: null,
        symbol: null,
        priceNative: 0,
        volume24h: 0,
        liquidityUsd: 0,
        priceChange24h: 0,
        priceChange1h: 0,
        priceChange6h: 0,
        marketCapUsd: 0,
      }
    }

    return {
        dexId: best.dexId || null,
        address: best.baseToken?.address || null,
        name: best.baseToken?.name || null,
        symbol: best.baseToken?.symbol || null,
        priceNative: Number(best.priceNative ?? 0),
        volume24h: Number(best.volume?.h24 ?? 0),
        liquidityUsd: Number(best.liquidity?.usd ?? 0),
        priceChange24h: Number(best.priceChange?.h24 ?? 0),
        priceChange1h: Number(best.priceChange?.h1 ?? 0),
        priceChange6h: Number(best.priceChange?.h6 ?? 0),
        marketCapUsd: Number(best.marketCap ?? 0),
    }
}