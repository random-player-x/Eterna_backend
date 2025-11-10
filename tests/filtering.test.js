// This file tests the filtering logic from src/routes/tokens.ts
// We extract the logic into a helper function for isolated unit testing.
const mockTokens1 = [
    { name: 'Token A', symbol: 'TKA', volume24h: 1000, liquidityUsd: 5000, priceUsd: 10 },
    { name: 'Token B', symbol: 'TKB', volume24h: 500, liquidityUsd: 2000, priceUsd: 5 },
    // Fixed typo: liquidityUsD -> liquidityUsd
    { name: 'Solana', symbol: 'SOL', volume24h: 100000, liquidityUsd: 500000, priceUsd: 150 },
    { name: 'Token C', symbol: 'TKC', volume24h: 2000, liquidityUsd: 10000, priceUsd: 20 },
    { name: 'Another Token', symbol: 'ANT', volume24h: 0, liquidityUsd: 0, priceUsd: 0 },
];
/**
 * This function mimics the filtering logic in the /tokens route
 * @param tokens - The array of tokens to filter
 * @param query - The mocked query parameters
 * @returns A filtered array of tokens
 */
// Fixed error: Return type should be Token1[] to match your type definition
function applyFilters(tokens, query) {
    let filteredTokens = [...tokens];
    const { minVolume24h, minLiquidityUsd, minPrice, name, symbol } = query;
    if (name) {
        filteredTokens = filteredTokens.filter(t => t.name?.toLowerCase().includes(name.toLowerCase()) ||
            t.symbol?.toLowerCase().includes(name.toLowerCase()));
    }
    if (minVolume24h) {
        filteredTokens = filteredTokens.filter(t => (t.volume24h ?? 0) >= Number(minVolume24h));
    }
    if (minLiquidityUsd) {
        // This filter will now work correctly for Solana
        filteredTokens = filteredTokens.filter(t => (t.liquidityUsd ?? 0) >= Number(minLiquidityUsd));
    }
    if (minPrice) {
        filteredTokens = filteredTokens.filter(t => (t.priceUsd ?? 0) >= Number(minPrice));
    }
    if (symbol) {
        filteredTokens = filteredTokens.filter(t => t.symbol?.toLowerCase() === symbol.toLowerCase());
    }
    return filteredTokens;
}
describe('Token Route Filtering Logic', () => {
    it('should filter by name (case-insensitive)', () => {
        const result = applyFilters(mockTokens1, { name: 'token' });
        expect(result.length).toBe(4); // <-- FIX: Was 3
        expect(result.map(t => t.symbol)).toEqual(['TKA', 'TKB', 'TKC', 'ANT']); // <-- FIX: Added 'ANT'
    });
    it('should filter by name matching symbol (case-insensitive)', () => {
        const result = applyFilters(mockTokens1, { name: 'sol' });
        expect(result.length).toBe(1);
        expect(result[0].symbol).toBe('SOL');
    });
    it('should filter by exact symbol (case-insensitive)', () => {
        const result = applyFilters(mockTokens1, { symbol: 'sol' });
        expect(result.length).toBe(1);
        expect(result[0].symbol).toBe('SOL');
    });
    it('should filter by minVolume24h', () => {
        const result = applyFilters(mockTokens1, { minVolume24h: 1500 });
        expect(result.length).toBe(2);
        expect(result.map(t => t.symbol)).toEqual(['SOL', 'TKC']);
    });
    it('should filter by minLiquidityUsd', () => {
        const result = applyFilters(mockTokens1, { minLiquidityUsd: 6000 });
        expect(result.length).toBe(2);
        expect(result.map(t => t.symbol)).toEqual(['SOL', 'TKC']);
    });
    it('should filter by minPrice', () => {
        const result = applyFilters(mockTokens1, { minPrice: 15 });
        expect(result.length).toBe(2);
        expect(result.map(t => t.symbol)).toEqual(['SOL', 'TKC']);
    });
    it('should correctly filter with 0 values', () => {
        const result = applyFilters(mockTokens1, { minVolume24h: 0, minLiquidityUsd: 0, minPrice: 0 });
        expect(result.length).toBe(5); // Includes the 0-value token
    });
    it('should correctly filter out 0 values', () => {
        const result = applyFilters(mockTokens1, { minVolume24h: 1, minLiquidityUsd: 1, minPrice: 1 });
        expect(result.length).toBe(4); // Excludes the 0-value token
    });
    it('should combine multiple filters', () => {
        // Find tokens with 'token' in name AND price >= 15
        const result = applyFilters(mockTokens1, { name: 'token', minPrice: 15 });
        expect(result.length).toBe(1);
        expect(result[0].symbol).toBe('TKC');
    });
    it('should return all tokens if no filters are provided', () => {
        const result = applyFilters(mockTokens1, {});
        expect(result.length).toBe(5);
    });
});
