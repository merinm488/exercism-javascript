import { describe, it } from '@jest/globals';
import assert from 'node:assert/strict';
import {
  filterPoolAsync,
  memoizeWithTTL,
  mapSeriesAsync,
  retryAsync,
} from './promises-intermediate-23.js';

// Small helper: sleep for n ms.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// TASK 1: filterPoolAsync
// ============================================================================
describe('filterPoolAsync', () => {
  it('returns only items whose predicate is truthy, in original order', async () => {
    const result = await filterPoolAsync(
      [1, 2, 3, 4, 5, 6],
      (n) => Promise.resolve(n % 2 === 0),
      2
    );
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('returns empty array for empty input', async () => {
    const result = await filterPoolAsync([], (x) => Promise.resolve(true), 3);
    assert.deepEqual(result, []);
  });

  it('keeps all items when predicate is always truthy', async () => {
    const result = await filterPoolAsync(
      [1, 2, 3],
      (n) => Promise.resolve(true),
      10
    );
    assert.deepEqual(result, [1, 2, 3]);
  });

  it('drops all items when predicate is always falsy', async () => {
    const result = await filterPoolAsync(
      [1, 2, 3, 4],
      (n) => Promise.resolve(false),
      2
    );
    assert.deepEqual(result, []);
  });

  it('treats truthy non-boolean values as passing', async () => {
    const result = await filterPoolAsync(
      ['a', '', 'b', null, 'c'],
      (x) => Promise.resolve(x),
      2
    );
    assert.deepEqual(result, ['a', 'b', 'c']);
  });

  it('never exceeds the concurrency limit', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const result = await filterPoolAsync(
      [1, 2, 3, 4, 5, 6, 7, 8],
      (n) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        return new Promise((resolve) => {
          setTimeout(() => {
            inFlight--;
            resolve(n % 2 === 0);
          }, 20);
        });
      },
      3
    );
    assert.deepEqual(result, [2, 4, 6, 8]);
    assert.equal(maxInFlight, 3, 'should never exceed the limit of 3');
  });

  it('limit of 1 behaves like sequential execution', async () => {
    const callOrder = [];
    const result = await filterPoolAsync(
      ['a', 'b', 'c', 'd'],
      (s) => {
        callOrder.push(s);
        return new Promise((resolve) =>
          setTimeout(() => resolve(s === 'b' || s === 'd'), 10)
        );
      },
      1
    );
    assert.deepEqual(result, ['b', 'd']);
    assert.deepEqual(callOrder, ['a', 'b', 'c', 'd']);
  });

  it('works with objects and a custom predicate', async () => {
    const users = [
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true },
    ];
    const result = await filterPoolAsync(
      users,
      (u) => Promise.resolve(u.active),
      2
    );
    assert.deepEqual(result, [
      { id: 1, active: true },
      { id: 3, active: true },
    ]);
  });
});

// ============================================================================
// TASK 2: memoizeWithTTL
// ============================================================================
describe('memoizeWithTTL', () => {
  it('calls fn only once for the same arg within the TTL', async () => {
    let callCount = 0;
    const fetch = (id) => {
      callCount++;
      return Promise.resolve(id * 10);
    };
    const m = memoizeWithTTL(fetch, 1000);

    await m(1);
    await m(1);
    await m(1);

    assert.equal(callCount, 1);
  });

  it('calls fn again for different arguments', async () => {
    let callCount = 0;
    const fetch = (id) => {
      callCount++;
      return Promise.resolve(id * 100);
    };
    const m = memoizeWithTTL(fetch, 1000);

    await m(1);
    await m(2);
    await m(1);
    await m(2);

    assert.equal(callCount, 2);
  });

  it('re-fetches after the TTL has elapsed', async () => {
    let callCount = 0;
    const fetch = (id) => {
      callCount++;
      return Promise.resolve(id * 10);
    };
    const m = memoizeWithTTL(fetch, 30);

    await m(1); // callCount = 1
    await m(1); // cached, callCount = 1
    assert.equal(callCount, 1);

    await sleep(50); // TTL elapses
    await m(1); // stale → re-fetch, callCount = 2
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
    const m = memoizeWithTTL(fetch, 1000);

    const p1 = m(5);
    const p2 = m(5);
    const p3 = m(5);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    assert.equal(r1, 50);
    assert.equal(r2, 50);
    assert.equal(r3, 50);
    assert.equal(callCount, 1);
  });

  it('uses the TTL per-key (one stale entry does not invalidate others)', async () => {
    let callCount = 0;
    const fetch = (id) => {
      callCount++;
      return Promise.resolve(id);
    };
    const m = memoizeWithTTL(fetch, 30);

    await m(1); // callCount = 1
    await m(2); // callCount = 2
    await sleep(50); // both entries go stale
    await m(1); // callCount = 3
    await m(2); // callCount = 4

    assert.equal(callCount, 4);
  });

  it('returns the cached value while still fresh', async () => {
    let callCount = 0;
    const fetch = (id) => {
      callCount++;
      return Promise.resolve({ id, fetchedAt: callCount });
    };
    const m = memoizeWithTTL(fetch, 100);

    const r1 = await m(7);
    const r2 = await m(7);

    assert.deepEqual(r1, { id: 7, fetchedAt: 1 });
    assert.deepEqual(r2, { id: 7, fetchedAt: 1 });
    assert.equal(callCount, 1);
  });

  it('works with string arguments', async () => {
    let callCount = 0;
    const fetch = (s) => {
      callCount++;
      return Promise.resolve(s.toUpperCase());
    };
    const m = memoizeWithTTL(fetch, 1000);

    assert.equal(await m('hello'), 'HELLO');
    assert.equal(await m('hello'), 'HELLO');
    assert.equal(await m('world'), 'WORLD');
    assert.equal(callCount, 2);
  });
});

// ============================================================================
// TASK 3: mapSeriesAsync
// ============================================================================
describe('mapSeriesAsync', () => {
  it('returns all results in original order', async () => {
    const result = await mapSeriesAsync([1, 2, 3], (n) =>
      Promise.resolve(n * 2)
    );
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('returns empty array for empty input', async () => {
    const result = await mapSeriesAsync([], (x) => Promise.resolve(x));
    assert.deepEqual(result, []);
  });

  it('processes items one at a time, in order', async () => {
    const startTimes = [];
    const result = await mapSeriesAsync([1, 2, 3], (n) => {
      startTimes.push({ n, time: Date.now() });
      return new Promise((resolve) =>
        setTimeout(() => resolve(n * 10), 20)
      );
    });
    assert.deepEqual(result, [10, 20, 30]);

    // Each call must start AFTER the previous one finished (~20ms apart)
    assert(
      startTimes[1].time - startTimes[0].time >= 15,
      'second call must wait for first'
    );
    assert(
      startTimes[2].time - startTimes[1].time >= 15,
      'third call must wait for second'
    );
  });

  it('takes roughly N * delay, not delay (proves sequential)', async () => {
    const start = Date.now();
    await mapSeriesAsync([1, 2, 3, 4], () =>
      new Promise((resolve) => setTimeout(() => resolve('ok'), 25))
    );
    const elapsed = Date.now() - start;
    // 4 items * 25ms each = ~100ms. If parallel, it would be ~25ms.
    assert(elapsed >= 90, `should take ~100ms sequential, took ${elapsed}ms`);
  });

  it('propagates rejections from fn', async () => {
    await assert.rejects(
      () =>
        mapSeriesAsync([1, 2, 3], (n) =>
          n === 2 ? Promise.reject(new Error('boom')) : Promise.resolve(n)
        ),
      /boom/
    );
  });

  it('works with objects', async () => {
    const users = [{ id: 1 }, { id: 2 }];
    const result = await mapSeriesAsync(users, (u) =>
      Promise.resolve({ ...u, name: 'User' + u.id })
    );
    assert.deepEqual(result, [
      { id: 1, name: 'User1' },
      { id: 2, name: 'User2' },
    ]);
  });

  it('handles a single-element array', async () => {
    const result = await mapSeriesAsync([42], (n) => Promise.resolve(n));
    assert.deepEqual(result, [42]);
  });
});

// ============================================================================
// TASK 4: retryAsync
// ============================================================================
describe('retryAsync', () => {
  it('returns the fulfilled value on the first attempt', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.resolve('ok');
    };
    const result = await retryAsync(fn, 3, 10);
    assert.equal(result, 'ok');
    assert.equal(callCount, 1);
  });

  it('retries until fn fulfills', async () => {
    let count = 0;
    const flaky = () => {
      count++;
      return count < 3
        ? Promise.reject(new Error('not yet'))
        : Promise.resolve('ok');
    };
    const result = await retryAsync(flaky, 5, 10);
    assert.equal(result, 'ok');
    assert.equal(count, 3);
  });

  it('rejects with the LAST error when all attempts fail', async () => {
    let count = 0;
    const alwaysFails = () => {
      count++;
      return Promise.reject(new Error('attempt ' + count));
    };
    await assert.rejects(
      () => retryAsync(alwaysFails, 3, 10),
      /attempt 3/
    );
    assert.equal(count, 3);
  });

  it('with attempts = 1 behaves like a single try with no retry', async () => {
    let count = 0;
    const fn = () => {
      count++;
      return Promise.reject(new Error('nope'));
    };
    await assert.rejects(
      () => retryAsync(fn, 1, 10),
      /nope/
    );
    assert.equal(count, 1);
  });

  it('waits delayMs BETWEEN attempts (not after the last one)', async () => {
    let count = 0;
    const failThenSucceed = () => {
      count++;
      return count < 3
        ? Promise.reject(new Error('fail'))
        : Promise.resolve('done');
    };
    const start = Date.now();
    await retryAsync(failThenSucceed, 5, 30);
    const elapsed = Date.now() - start;

    // 3 attempts → 2 waits between them → ~60ms
    assert(
      elapsed >= 50,
      `expected ~60ms (2 waits of 30ms), took ${elapsed}ms`
    );
    // Should NOT include a wait after the 3rd success.
    assert(
      elapsed < 120,
      `should not wait after the last attempt, took ${elapsed}ms`
    );
  });

  it('does not wait after the final failed attempt', async () => {
    const fn = () => Promise.reject(new Error('broken'));
    const start = Date.now();
    await assert.rejects(() => retryAsync(fn, 3, 50), /broken/);
    const elapsed = Date.now() - start;

    // 3 attempts → 2 waits → ~100ms. NOT 3 waits (which would be ~150ms).
    assert(
      elapsed >= 80,
      `expected ~100ms (2 waits of 50ms), took ${elapsed}ms`
    );
    assert(
      elapsed < 140,
      `should not wait after last failure, took ${elapsed}ms`
    );
  });

  it('resolves with async fn that returns a promise of a value', async () => {
    const fn = () =>
      new Promise((resolve) => setTimeout(() => resolve(42), 5));
    const result = await retryAsync(fn, 3, 10);
    assert.equal(result, 42);
  });

  it('handles fn that rejects with non-Error values', async () => {
    let count = 0;
    const fn = () => {
      count++;
      return count < 2
        ? Promise.reject('string error')
        : Promise.resolve('recovered');
    };
    const result = await retryAsync(fn, 3, 5);
    assert.equal(result, 'recovered');
    assert.equal(count, 2);
  });
});
