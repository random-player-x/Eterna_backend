import { pollDex } from '../src/poller.js';
import * as dexscreener from '../src/sources/dexscreener.js';
import * as normalizer from '../src/normalizer.js';
import * as jupiter from '../src/sources/jupiter.js';
import * as state from '../src/state.js';
import * as wsHub from '../src/server/wsHub.js';
import * as merge from '../src/merge.js';
import * as cache from '../src/cache.js';

// Mock all dependencies
// Use .js extension in mocks to match ES module resolution
jest.mock('../src/sources/dexscreener.js');
jest.mock('../src/normalizer.js');
jest.mock('../src/sources/jupiter.js');
jest.mock('../src/state.js');
jest.mock('../src/server/wsHub.js');
jest.mock('../src/merge.js');
jest.mock('../src/cache.js');

// Type-cast mocks for TypeScript
const mockedDexscreener = dexscreener as jest.Mocked<typeof dexscreener>;
const mockedNormalizer = normalizer as jest.Mocked<typeof normalizer>;
const mockedJupiter = jupiter as jest.Mocked<typeof jupiter>;
const mockedState = state as jest.Mocked<typeof state>;
const mockedWsHub = wsHub as jest.Mocked<typeof wsHub>;
const mockedMerge = merge as jest.Mocked<typeof merge>;
const mockedCache = cache as jest.Mocked<typeof cache>;

describe('Poller', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should execute the full polling, merging, and caching flow', async () => {
    // 1. Mock dexscreener.getLatestTokens
    const mockLatestTokens = [{ tokenAddress: 'addr1' }, { tokenAddress: 'addr2' }];
    mockedDexscreener.getLatestTokens.mockResolvedValue(mockLatestTokens);

    // 2. Mock jupiter.getJupiterPrices (for token addresses)
    const mockJupPrices = { addr1: { usdPrice: 10 }, addr2: { usdPrice: 20 } };
    mockedJupiter.getJupiterPrices.mockResolvedValueOnce(mockJupPrices);

    // 3. Mock dexscreener.getTokenDetails
    const mockDetails1 = { raw: 'details1' };
    const mockDetails2 = { raw: 'details2' };
    mockedDexscreener.getTokenDetails
      .mockResolvedValueOnce(mockDetails1)
      .mockResolvedValueOnce(mockDetails2);

    // 4. Mock normalizer.normalizeTokenData
    const mockNormalized1 = { address: 'addr1', priceNative: 0.1 };
    const mockNormalized2 = { address: 'addr2', priceNative: 0.2 };
    mockedNormalizer.normalizeTokenData
      .mockReturnValueOnce(mockNormalized1 as any)
      .mockReturnValueOnce(mockNormalized2 as any);

    // 5. Mock jupiter.getJupiterPrices (for SOL price)
    const solMint = "So11111111111111111111111111111111111111112";
    const mockSolPrice = { [solMint]: { usdPrice: 150 } };
    mockedJupiter.getJupiterPrices.mockResolvedValueOnce(mockSolPrice);

    // 6. Mock merge.mergeTokens
    const mockMergedTokens = [{ address: 'addr1', priceUsd: 10 }, { address: 'addr2', priceUsd: 20 }];
    mockedMerge.mergeTokens.mockReturnValue(mockMergedTokens as any);

    // 7. Mock implementations for state, ws, cache (just to ensure they are called)
    mockedState.setTokens.mockImplementation(() => {});
    mockedWsHub.broadcastUpdate.mockImplementation(() => {});
    mockedCache.setCache.mockImplementation(async () => {});

    // --- Execute poller ---
    await pollDex();

    // --- Assertions ---
    // 1. Discover tokens
    expect(mockedDexscreener.getLatestTokens).toHaveBeenCalledTimes(1);
    
    // 2. Get Jupiter prices for discovered tokens
    // Slices to 30 tokens, so we expect ['addr1', 'addr2']
    expect(mockedJupiter.getJupiterPrices).toHaveBeenCalledWith(['addr1', 'addr2']);
    
    // 3. Get Dex details for each address
    expect(mockedDexscreener.getTokenDetails).toHaveBeenCalledTimes(2);
    expect(mockedDexscreener.getTokenDetails).toHaveBeenCalledWith('addr1');
    expect(mockedDexscreener.getTokenDetails).toHaveBeenCalledWith('addr2');

    // 4. Normalize details
    expect(mockedNormalizer.normalizeTokenData).toHaveBeenCalledTimes(2);
    expect(mockedNormalizer.normalizeTokenData).toHaveBeenCalledWith(mockDetails1);
    expect(mockedNormalizer.normalizeTokenData).toHaveBeenCalledWith(mockDetails2);
    
    // 5. Get SOL price
    expect(mockedJupiter.getJupiterPrices).toHaveBeenCalledWith([solMint]);
    // Check that getJupiterPrices was called twice total
    expect(mockedJupiter.getJupiterPrices).toHaveBeenCalledTimes(2);

    // 6. Merge data
    expect(mockedMerge.mergeTokens).toHaveBeenCalledWith(
      [mockNormalized1, mockNormalized2], // dexTokens
      mockJupPrices,                     // jupData
      150                                // solPriceUsd
    );

    // 7. Store in memory, broadcast, and cache
    expect(mockedState.setTokens).toHaveBeenCalledWith(mockMergedTokens);
    expect(mockedWsHub.broadcastUpdate).toHaveBeenCalledWith({ type: "update", tokens: mockMergedTokens });
    expect(mockedCache.setCache).toHaveBeenCalledWith("tokens", mockMergedTokens, 30);
  });

  it('should handle zero SOL price gracefully', async () => {
     // 1. Mock dexscreener.getLatestTokens
    const mockLatestTokens = [{ tokenAddress: 'addr1' }];
    mockedDexscreener.getLatestTokens.mockResolvedValue(mockLatestTokens);

    // 2. Mock jupiter.getJupiterPrices (for token addresses)
    const mockJupPrices = { addr1: { usdPrice: 10 } };
    mockedJupiter.getJupiterPrices.mockResolvedValueOnce(mockJupPrices);

    // 3. Mock dexscreener.getTokenDetails
    const mockDetails1 = { raw: 'details1' };
    mockedDexscreener.getTokenDetails.mockResolvedValueOnce(mockDetails1);

    // 4. Mock normalizer.normalizeTokenData
    const mockNormalized1 = { address: 'addr1', priceNative: 0.1 };
    mockedNormalizer.normalizeTokenData.mockReturnValueOnce(mockNormalized1 as any);

    // 5. Mock jupiter.getJupiterPrices (for SOL price) - return 0
    const solMint = "So11111111111111111111111111111111111111112";
    const mockSolPrice = { [solMint]: { usdPrice: 0 } }; // SOL price is 0
    mockedJupiter.getJupiterPrices.mockResolvedValueOnce(mockSolPrice);

    const mockMergedTokens = [{ address: 'addr1', priceUsd: 5 }]; // Mocked merge result
    mockedMerge.mergeTokens.mockReturnValue(mockMergedTokens as any);

    await pollDex();

    // Check that mergeTokens was called with solPriceUsd = 0
    expect(mockedMerge.mergeTokens).toHaveBeenCalledWith(
      [mockNormalized1],
      mockJupPrices,
      0 // solPriceUsd
    );
  });
});