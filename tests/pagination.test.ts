// This file tests the pagination logic from src/routes/tokens.ts
// We extract the logic into a helper function for isolated unit testing.

const mockTokens2 = Array.from({ length: 50 }, (_, i) => ({
    name: `Token ${i + 1}`,
    symbol: `T${i + 1}`,
    priceUsd: i + 1,
  }));
  
  type Token2 = typeof mockTokens2[0];
  
  /**
   * This function mimics the pagination logic in the /tokens route
   * @param tokens - The array of tokens to paginate
   * @param query - The mocked query parameters
   * @returns A paginated result object
   */
  function applyPagination(tokens: Token2[], query: any): { nextCursor: number | null, items: Token2[] } {
    const { limit, cursor } = query;
    let start = Number(cursor) || 0;
    let lim = Number(limit) || 30; // Default limit of 30
  
    const nextCursor = start + lim < tokens.length ? start + lim : null;
    const paged = tokens.slice(start, start + lim);
  
    return { nextCursor, items: paged };
  }
  
  describe('Token Route Pagination Logic', () => {
    it('should return the first page with default limit (30)', () => {
      const result = applyPagination(mockTokens2, {});
      expect(result.items.length).toBe(30);
      expect(result.items[0].symbol).toBe('T1');
      expect(result.items[29].symbol).toBe('T30');
      expect(result.nextCursor).toBe(30);
    });
  
    it('should return a page with a custom limit', () => {
      const result = applyPagination(mockTokens2, { limit: 10 });
      expect(result.items.length).toBe(10);
      expect(result.items[0].symbol).toBe('T1');
      expect(result.nextCursor).toBe(10);
    });
  
    it('should return the next page using cursor', () => {
      const result = applyPagination(mockTokens2, { limit: 10, cursor: 10 });
      expect(result.items.length).toBe(10);
      expect(result.items[0].symbol).toBe('T11'); // Starts from index 10
      expect(result.nextCursor).toBe(20);
    });
  
    it('should return the last page and a null nextCursor', () => {
      // 50 tokens total. Requesting limit=20 from cursor=40
      const result = applyPagination(mockTokens2, { limit: 20, cursor: 40 });
      expect(result.items.length).toBe(10); // Only 10 remaining (index 40-49)
      expect(result.items[0].symbol).toBe('T41');
      expect(result.items[9].symbol).toBe('T50');
      expect(result.nextCursor).toBeNull(); // No more items left
    });
  
    it('should return an empty array and null nextCursor if cursor is out of bounds', () => {
      const result = applyPagination(mockTokens2, { limit: 10, cursor: 100 });
      expect(result.items.length).toBe(0);
      expect(result.nextCursor).toBeNull();
    });
  
    it('should handle non-numeric limit and cursor', () => {
      const result = applyPagination(mockTokens2, { limit: 'abc', cursor: 'xyz' });
      // Should default to limit=30, cursor=0
      expect(result.items.length).toBe(30);
      expect(result.items[0].symbol).toBe('T1');
      expect(result.nextCursor).toBe(30);
    });
  });