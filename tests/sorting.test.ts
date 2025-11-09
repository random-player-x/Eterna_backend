// This file tests the sorting logic from src/routes/tokens.ts
// We extract the logic into a helper function for isolated unit testing.

const mockTokens = [
    { name: 'Token A', symbol: 'TKA', volume24h: 1000, priceUsd: 10, priceChange1h: 1, priceChange6h: 5, priceChange24h: 10 },
    { name: 'Token B', symbol: 'TKB', volume24h: 500, priceUsd: 5, priceChange1h: -1, priceChange6h: 2, priceChange24h: -5 },
    { name: 'Solana', symbol: 'SOL', volume24h: 100000, priceUsd: 150, priceChange1h: 0.5, priceChange6h: 3, priceChange24h: 8 },
    { name: 'Token C', symbol: 'TKC', volume24h: 2000, priceUsd: 20, priceChange1h: 2, priceChange6h: 1, priceChange24h: 15 },
  ];
  
  type Token = typeof mockTokens[0];
  
  /**
   * This function mimics the sorting logic in the /tokens route
   * @param tokens - The array of tokens to sort
   * @param query - The mocked query parameters
   * @returns A sorted array of tokens
   */
  function applySorting(tokens: Token[], query: any): Token[] {
    let sortedTokens = [...tokens]; // Create a copy
    let { sort, order, period } = query;
    
    // Default period is '24h' as per the route logic
    period = period || '24h';
    
    if (sort) {
      const priceChangeKey = `priceChange${period}`;
      
      sortedTokens = sortedTokens.sort((a, b) => {
        // Determine which values to compare
        const av = sort === "priceChange" ? a[priceChangeKey] ?? 0 : a[sort] ?? 0;
        const bv = sort === "priceChange" ? b[priceChangeKey] ?? 0 : b[sort] ?? 0;
  
        if (order === "asc") {
          return av - bv;
        }
        return bv - av; // Default to descending
      });
    }
    return sortedTokens;
  }
  
  describe('Token Route Sorting Logic', () => {
    it('should not sort if "sort" query is not provided', () => {
      const result = applySorting(mockTokens, {});
      // Should return the original order
      expect(result.map(t => t.symbol)).toEqual(['TKA', 'TKB', 'SOL', 'TKC']);
    });
  
    it('should sort by volume24h descending by default', () => {
      const result = applySorting(mockTokens, { sort: 'volume24h' });
      expect(result.map(t => t.symbol)).toEqual(['SOL', 'TKC', 'TKA', 'TKB']);
    });
  
    it('should sort by volume24h ascending', () => {
      const result = applySorting(mockTokens, { sort: 'volume24h', order: 'asc' });
      expect(result.map(t => t.symbol)).toEqual(['TKB', 'TKA', 'TKC', 'SOL']);
    });
  
    it('should sort by priceUsd descending', () => {
      const result = applySorting(mockTokens, { sort: 'priceUsd' });
      expect(result.map(t => t.symbol)).toEqual(['SOL', 'TKC', 'TKA', 'TKB']);
    });
  
    it('should sort by priceChange (default 24h) descending', () => {
      const result = applySorting(mockTokens, { sort: 'priceChange' });
      // Expected order: 15, 10, 8, -5
      expect(result.map(t => t.symbol)).toEqual(['TKC', 'TKA', 'SOL', 'TKB']);
    });
  
    it('should sort by priceChange (1h) ascending', () => {
      const result = applySorting(mockTokens, { sort: 'priceChange', order: 'asc', period: '1h' });
      // Expected order: -1, 0.5, 1, 2
      expect(result.map(t => t.symbol)).toEqual(['TKB', 'SOL', 'TKA', 'TKC']);
    });
  
    it('should sort by priceChange (6h) descending', () => {
      const result = applySorting(mockTokens, { sort: 'priceChange', period: '6h' });
      // Expected order: 5, 3, 2, 1
      expect(result.map(t => t.symbol)).toEqual(['TKA', 'SOL', 'TKB', 'TKC']);
    });
  
    it('should handle sorting on a period that does not exist', () => {
      // 'priceChange5m' does not exist, so it will sort by 0 vs 0 (unstable sort, likely original order)
      const result = applySorting(mockTokens, { sort: 'priceChange', period: '5m' });
      // The sort uses `?? 0`, so all values are 0. The order is not guaranteed.
      // We'll just check that it returns the correct number of items.
      expect(result.length).toBe(4);
    });
  });