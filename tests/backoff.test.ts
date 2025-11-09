import { retry } from '../src/lib/backoff';

test('retry eventually succeeds with exponential backoff', async () => {
  let n = 0;
  const result = await retry(async () => {
    if (++n < 3) throw new Error('fail');
    return 42;
  }, 5, 1);
  expect(result).toBe(42);
});
