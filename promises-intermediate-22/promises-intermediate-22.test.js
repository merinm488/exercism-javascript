import { describe, it } from '@jest/globals';
import assert from 'node:assert/strict';
import {
  mapPoolAsync,
  memoizeAsync,
  chunkedMapAsync,
  anyAsync,
  mapWithTimeoutAsync,
  debounceImmediateAsync,
} from './promises-intermediate-22.js';

// ============================================================================
// TASK 1: mapPoolAsync
// ============================================================================
describe('mapPoolAsync', () => {
  it('returns results in the same order as input', async () => {
    const result = await mapPoolAsync(
      [1, 2, 3, 4, 5],
      (n) => Promise.resolve(n * 10),
      2
    );
    assert.deepEqual(result, [10, 20, 30, 40, 50]);
  });

  it('returns empty array for empty input', async () => {
    const result = await mapPoolAsync([], (x) => Promise.resolve(x), 3);
    assert.deepEqual(result, []);
  });

  it('handles limit larger than items.length', async () => {
    const result = await mapPoolAsync(
      [1, 2],
      (n) => Promise.resolve(n),
      10
    );
    assert.deepEqual(result, [1, 2]);
  });

  it('never exceeds the concurrency limit', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const result = await mapPoolAsync(
      [1, 2, 3, 4, 5, 6, 7, 8],
      (n) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        return new Promise((resolve) => {
          setTimeout(() => {
            inFlight--;
            resolve(n * 2);
          }, 20);
        });
      },
      3
    );
    assert.deepEqual(result, [2, 4, 6, 8, 10, 12, 14, 16]);
    assert.equal(maxInFlight, 3, 'should never exceed the limit of 3');
  });

  it('limit of 1 behaves like sequential execution', async () => {
    const callOrder = [];
    const result = await mapPoolAsync(
      ['a', 'b', 'c'],
      (s) => {
        callOrder.push(s);
        return new Promise((resolve) =>
          setTimeout(() => resolve(s.toUpperCase()), 10)
        );
      },
      1
    );
    assert.deepEqual(result, ['A', 'B', 'C']);
    assert.deepEqual(callOrder, ['a', 'b', 'c']);
  });

  it('works with objects', async () => {
    const users = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = await mapPoolAsync(
      users,
      (u) => Promise.resolve({ ...u, name: 'User' + u.id }),
      2
    );
    assert.deepEqual(result, [
      { id: 1, name: 'User1' },
      { id: 2, name: 'User2' },
      { id: 3, name: 'User3' },
    ]);
  });
});

// ============================================================================
// TASK 2: memoizeAsync
// ============================================================================
describe('memoizeAsync', () => {
  it('calls fn only once for the same argument', async () => {
    let callCount = 0;
    const fetch = (id) => {
      callCount++;
      return Promise.resolve({ id, name: 'User' + id });
    };
    const memoized = memoizeAsync(fetch);

    const r1 = await memoized(1);
    const r2 = await memoized(1);
    const r3 = await memoized(1);

    assert.deepEqual(r1, { id: 1, name: 'User1' });
    assert.deepEqual(r2, { id: 1, name: 'User1' });
    assert.deepEqual(r3, { id: 1, name: 'User1' });
    assert.equal(callCount, 1);
  });

  it('calls fn again for different arguments', async () => {
    let callCount = 0;
    const fetch = (id) => {
      callCount++;
      return Promise.resolve(id * 100);
    };
    const memoized = memoizeAsync(fetch);

    await memoized(1);
    await memoized(2);
    await memoized(1);
    await memoized(2);

    assert.equal(callCount, 2);
  });

  it('shares a single fn call for concurrent requests with the same arg', async () => {
    let callCount = 0;
    const fetch = (id) => {
      callCount++;
      return new Promise((resolve) =>
        setTimeout(() => resolve(id * 10), 20)
      );
    };
    const memoized = memoizeAsync(fetch);

    // Fire 3 calls BEFORE any of them resolve
    const p1 = memoized(5);
    const p2 = memoized(5);
    const p3 = memoized(5);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    assert.equal(r1, 50);
    assert.equal(r2, 50);
    assert.equal(r3, 50);
    assert.equal(callCount, 1);
  });

  it('uses keyFn when provided (for object arguments)', async () => {
    let callCount = 0;
    const fetch = (user) => {
      callCount++;
      return Promise.resolve(user.id * 2);
    };
    const memoized = memoizeAsync(fetch, (user) => user.id);

    await memoized({ id: 1, name: 'Alice' });
    await memoized({ id: 1, name: 'Alice Duplicate' }); // same id, cached
    await memoized({ id: 2, name: 'Bob' });

    assert.equal(callCount, 2);
  });

  it('works with string arguments by default', async () => {
    let callCount = 0;
    const fetch = (s) => {
      callCount++;
      return Promise.resolve(s.toUpperCase());
    };
    const memoized = memoizeAsync(fetch);

    assert.equal(await memoized('hello'), 'HELLO');
    assert.equal(await memoized('hello'), 'HELLO');
    assert.equal(await memoized('world'), 'WORLD');
    assert.equal(callCount, 2);
  });
});

// ============================================================================
// TASK 3: chunkedMapAsync
// ============================================================================
describe('chunkedMapAsync', () => {
  it('returns all results in original order', async () => {
    const result = await chunkedMapAsync(
      [1, 2, 3, 4, 5, 6, 7],
      (n) => Promise.resolve(n * 2),
      3
    );
    assert.deepEqual(result, [2, 4, 6, 8, 10, 12, 14]);
  });

  it('returns empty array for empty input', async () => {
    const result = await chunkedMapAsync([], (x) => Promise.resolve(x), 3);
    assert.deepEqual(result, []);
  });

  it('handles chunkSize larger than items.length', async () => {
    const result = await chunkedMapAsync(
      [1, 2],
      (n) => Promise.resolve(n * 10),
      5
    );
    assert.deepEqual(result, [10, 20]);
  });

  it('chunkSize of 1 processes everything sequentially', async () => {
    const callTimes = [];
    const result = await chunkedMapAsync(
      [1, 2, 3],
      (n) => {
        callTimes.push(Date.now());
        return new Promise((resolve) =>
          setTimeout(() => resolve(n * 10), 15)
        );
      },
      1
    );
    assert.deepEqual(result, [10, 20, 30]);
    // Each call should start after the previous one finished (~15ms apart)
    assert(callTimes[1] - callTimes[0] >= 10, 'second call must wait for first');
    assert(callTimes[2] - callTimes[1] >= 10, 'third call must wait for second');
  });

  it('processes chunks sequentially but items within a chunk in parallel', async () => {
    const startTimes = [];
    const result = await chunkedMapAsync(
      [1, 2, 3, 4, 5, 6],
      (n) => {
        startTimes.push({ n, time: Date.now() });
        return new Promise((resolve) =>
          setTimeout(() => resolve(n), 20)
        );
      },
      3
    );
    assert.deepEqual(result, [1, 2, 3, 4, 5, 6]);

    // Chunk 1 (items 1,2,3) should start near-simultaneously
    const chunk1 = startTimes.filter((x) => x.n <= 3);
    const chunk2 = startTimes.filter((x) => x.n > 3);
    const chunk1Spread = Math.max(...chunk1.map((x) => x.time)) - Math.min(...chunk1.map((x) => x.time));
    assert(chunk1Spread < 10, 'items in chunk 1 should start in parallel');

    // Chunk 2 must start AFTER chunk 1's items finish
    const chunk1End = Math.min(...chunk2.map((x) => x.time));
    const chunk2Start = Math.max(...chunk1.map((x) => x.time));
    assert(chunk1End - chunk2Start >= 15, 'chunk 2 must wait for chunk 1');
  });

  it('handles single chunk', async () => {
    const result = await chunkedMapAsync(
      [1, 2, 3],
      (n) => Promise.resolve(n * n),
      10
    );
    assert.deepEqual(result, [1, 4, 9]);
  });
});

// ============================================================================
// TASK 4: anyAsync
// ============================================================================
describe('anyAsync', () => {
  it('resolves with the first fulfilled value', async () => {
    const result = await anyAsync(
      [1, 2, 3],
      (n) => Promise.resolve(n * 10)
    );
    // All resolve, so first one wins
    assert.equal(result, 10);
  });

  it('ignores rejections until one fulfills', async () => {
    const result = await anyAsync(
      [1, 2, 3],
      (n) => (n === 2 ? Promise.resolve(n) : Promise.reject('no'))
    );
    assert.equal(result, 2);
  });

  it('resolves even if some rejections come first', async () => {
    // Item 1 rejects immediately, item 2 takes longer but fulfills
    const result = await anyAsync([1, 2], (n) => {
      if (n === 1) return Promise.reject('fail');
      return new Promise((resolve) => setTimeout(() => resolve(n), 10));
    });
    assert.equal(result, 2);
  });

  it('rejects when all promises reject', async () => {
    await assert.rejects(
      () =>
        anyAsync(
          [1, 2, 3],
          (n) => Promise.reject(new Error('fail ' + n))
        ),
      /All promises rejected/
    );
  });

  it('rejects for empty input', async () => {
    await assert.rejects(
      () => anyAsync([], (x) => Promise.resolve(x)),
      /All promises rejected/
    );
  });

  it('works with objects', async () => {
    const items = [{ fast: false }, { fast: true }, { fast: false }];
    const result = await anyAsync(items, (item) =>
      item.fast ? Promise.resolve(item) : Promise.reject('not fast')
    );
    assert.deepEqual(result, { fast: true });
  });
});

// ============================================================================
// TASK 5: mapWithTimeoutAsync
// ============================================================================
describe('mapWithTimeoutAsync', () => {
  it('resolves with all values when every call is fast enough', async () => {
    const result = await mapWithTimeoutAsync(
      [1, 2, 3],
      (n) => Promise.resolve(n * 2),
      1000
    );
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('rejects when any call exceeds the timeout', async () => {
    await assert.rejects(
      () =>
        mapWithTimeoutAsync(
          [1, 2, 3],
          (n) =>
            n === 2
              ? new Promise((r) => setTimeout(() => r(n), 50))
              : Promise.resolve(n),
          10
        ),
      /Timeout/
    );
  });

  it('resolves when all calls complete just under the timeout', async () => {
    const result = await mapWithTimeoutAsync(
      [1, 2, 3],
      (n) => new Promise((r) => setTimeout(() => r(n * 10), 5)),
      30
    );
    assert.deepEqual(result, [10, 20, 30]);
  });

  it('returns empty array for empty input', async () => {
    const result = await mapWithTimeoutAsync(
      [],
      (x) => Promise.resolve(x),
      100
    );
    assert.deepEqual(result, []);
  });

  it('rejects when fn itself rejects (even within timeout)', async () => {
    await assert.rejects(
      () =>
        mapWithTimeoutAsync(
          [1, 2],
          (n) => (n === 1 ? Promise.resolve(n) : Promise.reject(new Error('bad'))),
          1000
        ),
      /bad/
    );
  });

  it('handles a mix of fast and slow (within timeout)', async () => {
    const result = await mapWithTimeoutAsync(
      [1, 2, 3],
      (n) =>
        new Promise((resolve) =>
          setTimeout(() => resolve(n), n === 2 ? 20 : 1)
        ),
      100
    );
    assert.deepEqual(result, [1, 2, 3]);
  });
});

// ============================================================================
// TASK 6: debounceImmediateAsync
// ============================================================================
describe('debounceImmediateAsync', () => {
  it('executes the first call immediately', async () => {
    let callCount = 0;
    const expensive = (val) => {
      callCount++;
      return Promise.resolve(val * 2);
    };
    const debounced = debounceImmediateAsync(expensive, 100);

    const start = Date.now();
    const result = await debounced(5);
    const elapsed = Date.now() - start;

    assert.equal(result, 10);
    assert.equal(callCount, 1);
    assert(elapsed < 20, 'should not wait before first call');
  });

  it('ignores subsequent calls within the cooldown', async () => {
    let callCount = 0;
    const expensive = (val) => {
      callCount++;
      return Promise.resolve(val);
    };
    const debounced = debounceImmediateAsync(expensive, 100);

    const p1 = debounced(1);
    const p2 = debounced(2);
    const p3 = debounced(3);

    // All three should return the SAME promise (the first one)
    assert.equal(p1, p2);
    assert.equal(p2, p3);

    const results = await Promise.all([p1, p2, p3]);
    assert.deepEqual(results, [1, 1, 1]); // all resolve to first call's value
    assert.equal(callCount, 1);
  });

  it('executes again after the cooldown ends', async () => {
    let callCount = 0;
    const expensive = (val) => {
      callCount++;
      return Promise.resolve(val * 10);
    };
    const debounced = debounceImmediateAsync(expensive, 50);

    await debounced(1); // callCount = 1
    // Wait for cooldown to pass
    await new Promise((r) => setTimeout(r, 60));
    const result = await debounced(2); // callCount = 2

    assert.equal(result, 20);
    assert.equal(callCount, 2);
  });

  it('shares the resolved value across cooldown calls', async () => {
    const expensive = (val) =>
      new Promise((resolve) => setTimeout(() => resolve(val * 2), 10));
    const debounced = debounceImmediateAsync(expensive, 100);

    const p1 = debounced(7);
    const p2 = debounced(99);
    const p3 = debounced(123);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
    assert.equal(r1, 14);
    assert.equal(r2, 14); // ignored, shares p1's result
    assert.equal(r3, 14); // ignored, shares p1's result
  });

  it('returns empty array for empty input (edge)', async () => {
    // Sanity: the debounced function should still behave like fn
    const expensive = (x) => Promise.resolve([x]);
    const debounced = debounceImmediateAsync(expensive, 50);
    const result = await debounced(42);
    assert.deepEqual(result, [42]);
  });
});
