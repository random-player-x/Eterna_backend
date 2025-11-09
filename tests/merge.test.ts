import { mergeTokens } from '../src/merge.js';

describe('Token Merger Logic', () => {
  it('should merge dex and jupiter data, calculating final price as average', () => {
    const dexTokens = [
      {
        address: 'addr1',
        priceNative: 10,
        name: 'Token A',
        symbol: 'TKA',
        volume24h: 1000,
        liquidityUsd: 5000,
        priceChange1h: 1,
        priceChange6h: 2,
        priceChange24h: 3,
        marketCapUsd: 10000,
        dexId: 'dex1',
      },
    ];
    const jupData = {
      addr1: { usdPrice: 220 },
    };
    const solPriceUsd = 20; // Dex price in USD will be priceNative * solPriceUsd (10 * 20 = 200)

    const merged = mergeTokens(dexTokens, jupData, solPriceUsd);
    
    expect(merged.length).toBe(1);
    const token = merged[0];
    
    expect(token.address).toBe('addr1');
    expect(token.dexPriceUsd).toBe(200); // 10 * 20
    expect(token.jupiterPriceUsd).toBe(220);
    expect(token.priceUsd).toBe(210); // Average: (200 + 220) / 2
    expect(token.name).toBe('Token A');
    expect(token.symbol).toBe('TKA');
    expect(token.marketCapUsd).toBe(10000);
  });

  it('should use only dex price if jupiter price is missing for a token', () => {
    const dexTokens = [
      {
        address: 'addr1',
        priceNative: 10,
        name: 'Token A',
        symbol: 'TKA',
        // ... other fields
      },
    ];
    const jupData = {}; // No jup data for addr1
    const solPriceUsd = 20;

    const merged = mergeTokens(dexTokens, jupData, solPriceUsd);
    
    expect(merged.length).toBe(1);
    const token = merged[0];
    
    expect(token.dexPriceUsd).toBe(200);
    expect(token.jupiterPriceUsd).toBeNull();
    expect(token.priceUsd).toBe(200); // Falls back to just dexUsdPrice
  });

  it('should handle jupiter price being present but null', () => {
    const dexTokens = [
      {
        address: 'addr1',
        priceNative: 10,
        name: 'Token A',
        symbol: 'TKA',
        // ... other fields
      },
    ];
    const jupData = {
      addr1: { usdPrice: null }
    };
    const solPriceUsd = 20;

    const merged = mergeTokens(dexTokens, jupData, solPriceUsd);
    
    expect(merged.length).toBe(1);
    const token = merged[0];
    
    expect(token.dexPriceUsd).toBe(200);
    expect(token.jupiterPriceUsd).toBeNull();
    expect(token.priceUsd).toBe(200); // Falls back to just dexUsdPrice
  });

  it('should correctly merge multiple tokens', () => {
    const dexTokens = [
      { address: 'addr1', priceNative: 1, name: 'Token A', symbol: 'TKA' },
      { address: 'addr2', priceNative: 2, name: 'Token B', symbol: 'TKB' },
    ];
    const jupData = {
      addr1: { usdPrice: 12 }, // Dex price = 10, Avg = 11
      // No data for addr2
    };
    const solPriceUsd = 10;

    const merged = mergeTokens(dexTokens, jupData, solPriceUsd);
    
    expect(merged.length).toBe(2);
    expect(merged[0].priceUsd).toBe(11); // (1*10 + 12) / 2
    expect(merged[1].priceUsd).toBe(20); // 2 * 10
  });
});