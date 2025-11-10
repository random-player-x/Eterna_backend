import Fastify from 'fastify';
import { tokensRoute } from '../src/routes/tokens';
import { setTokens } from '../src/state';
test('response items have required keys', async () => {
    const app = Fastify();
    app.register(tokensRoute);
    await app.ready();
    setTokens([
        { dexId: 'raydium', address: 'A', name: 'A', symbol: 'A', priceUsd: 1, volume24h: 1, liquidityUsd: 1, priceChange1h: 1, priceChange6h: 1, priceChange24h: 1, marketCapUsd: 10 }
    ]);
    const r = await app.inject({ method: 'GET', url: '/tokens' });
    const body = JSON.parse(r.payload);
    const arr = body.items;
    expect(Array.isArray(arr)).toBe(true);
    expect(arr[0]).toHaveProperty('address');
    expect(arr[0]).toHaveProperty('priceUsd');
    expect(arr[0]).toHaveProperty('volume24h');
    await app.close();
});
