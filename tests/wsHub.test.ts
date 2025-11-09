import { broadcastUpdate } from '../src/server/wsHub';

test('broadcastUpdate should not throw without server', () => {
  expect(() => broadcastUpdate({ type:'update', tokens: []})).not.toThrow();
});
