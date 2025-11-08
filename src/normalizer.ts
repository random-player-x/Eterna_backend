export function normalizeTokenData(tokenData: any) {
    const pairs = tokenData?.pairs || [];
    
    const best = pairs.sort((a: any, b: any) => {
        const volumeA = a?.volumeUSD24h || 0;
        const volumeB = b?.volumeUSD24h || 0;
        return volumeB - volumeA;
    }
    )[0];
    
    return {
        address: best.baseToken?.address || null,
        name: best.baseToken?.name || null,
        symbol: best.baseToken?.symbol || null,
        priceNative: Number(best.priceNative ?? 0),
        volume24h: Number(best.volume?.h24 ?? 0),
        liquidityUsd: Number(best.liquidity?.usd ?? 0),
        priceChange24h: Number(best.priceChange?.h24 ?? 0),
    }
}