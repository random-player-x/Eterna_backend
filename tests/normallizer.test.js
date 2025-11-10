import { normalizeTokenData } from '../src/normalizer.js';
describe('Token Data Normalizer', () => {
    it('should normalize raw dexscreener data, picking the pair with highest 24h USD volume', () => {
        const rawData = {
            pairs: [
                {
                    dexId: 'dex1',
                    baseToken: { address: 'addr1', name: 'Token A', symbol: 'TKA' },
                    priceNative: '10',
                    volume: { h24: 1000 },
                    liquidity: { usd: 5000 },
                    priceChange: { h24: 5, h6: 2, h1: 1 },
                    marketCap: 10000,
                    volumeUSD24h: 1000,
                },
                {
                    dexId: 'dex2',
                    baseToken: { address: 'addr1', name: 'Token A', symbol: 'TKA' },
                    priceNative: '11',
                    volume: { h24: 2000 },
                    liquidity: { usd: 6000 },
                    priceChange: { h24: 6, h6: 3, h1: 1.5 },
                    marketCap: 11000,
                    volumeUSD24h: 2000,
                },
                {
                    dexId: 'dex3',
                    baseToken: { address: 'addr1', name: 'Token A', symbol: 'TKA' },
                    priceNative: '12',
                    volume: { h24: 500 },
                    liquidity: { usd: 3000 },
                    priceChange: { h24: 4, h6: 1, h1: 0.5 },
                    marketCap: 12000,
                    volumeUSD24h: 500,
                },
            ],
        };
        const normalized = normalizeTokenData(rawData);
        // This expectation is now correct based on the fixed normalizer
        expect(normalized).toEqual({
            dexId: 'dex2',
            address: 'addr1',
            name: 'Token A',
            symbol: 'TKA',
            priceNative: 11,
            volume24h: 2000,
            liquidityUsd: 6000,
            priceChange24h: 6,
            priceChange1h: 1.5, // h1
            priceChange6h: 3, // h6
            marketCapUsd: 11000,
        });
    });
    it('should handle missing or null data fields gracefully', () => {
        const rawData = {
            pairs: [
                {
                    dexId: 'dex1',
                    baseToken: { address: 'addr1', name: 'Token A', symbol: 'TKA' },
                    priceNative: '10',
                    // All other fields are missing
                },
            ],
        };
        const normalized = normalizeTokenData(rawData);
        expect(normalized).toEqual({
            dexId: 'dex1',
            address: 'addr1',
            name: 'Token A',
            symbol: 'TKA',
            priceNative: 10,
            volume24h: 0,
            liquidityUsd: 0,
            priceChange24h: 0,
            priceChange1h: 0,
            priceChange6h: 0,
            marketCapUsd: 0,
        });
    });
    it('should return nulls for baseToken info if missing', () => {
        const rawData = {
            pairs: [
                {
                    dexId: 'dex1',
                    // baseToken is missing
                },
            ],
        };
        const normalized = normalizeTokenData(rawData);
        expect(normalized.address).toBeNull();
        expect(normalized.name).toBeNull();
        expect(normalized.symbol).toBeNull();
    });
    it('should handle an empty pairs array', () => {
        const rawData = { pairs: [] };
        const normalized = normalizeTokenData(rawData);
        // Should return default/null values
        expect(normalized).toEqual({
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
        });
    });
    it('should handle a null or undefined input', () => {
        const normalized = normalizeTokenData(null);
        expect(normalized).toEqual({
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
        });
    });
});
