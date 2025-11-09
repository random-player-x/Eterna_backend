import axios from 'axios';
import { getJupiterPrices } from '../src/sources/jupiter.js';

// Mock the axios library
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Jupiter Source', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
  });

  it('should return an empty object if no addresses are provided', async () => {
    const prices = await getJupiterPrices([]);
    expect(prices).toEqual({});
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('should fetch prices from Jupiter API and return data', async () => {
    const addresses = ['addr1', 'addr2'];
    const mockData = { data: { addr1: { usdPrice: 100 }, addr2: { usdPrice: 200 } } };
    
    // Mock the axios.get call to resolve with mock data
    mockedAxios.get.mockResolvedValue(mockData);

    const prices = await getJupiterPrices(addresses);

    const ids = addresses.join(',');
    const expectedUrl = `https://lite-api.jup.ag/price/v3?ids=${encodeURIComponent(ids)}`;
    
    expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl);
    expect(prices).toEqual(mockData.data);
  });

  it('should handle API errors gracefully', async () => {
    const addresses = ['addr1'];
    const apiError = new Error('API Error');
    
    // Mock the axios.get call to reject with an error
    mockedAxios.get.mockRejectedValue(apiError);

    // Expect the function to throw the error
    await expect(getJupiterPrices(addresses)).rejects.toThrow('API Error');
  });
});