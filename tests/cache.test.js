import { setCache, getCache } from '../src/cache';
test('set/get cache roundtrip', async () => {
    await setCache('t', { hello: 'world' }, 5);
    const v = await getCache('t');
    expect(v).toEqual({ hello: 'world' });
});
