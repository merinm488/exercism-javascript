import { describe, it } from '@jest/globals';
import assert from 'node:assert/strict';
import {
  snippet1, snippet2, snippet3, snippet4, snippet5, snippet6,
  prediction1, prediction2, prediction3, prediction4, prediction5, prediction6,
  memoizeLRU,
  poolFirstAsync,
  createSequentialQueue,
  createLatch,
} from './promises-intermediate-24.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: capture every console.log value a function produces, including those
// logged from microtasks and macrotasks scheduled during its execution.
async function captureOutput(fn) {
  const logged = [];
  const origLog = console.log;
  console.log = (...args) => logged.push(args.join(' '));
  try {
    fn();
    // Flush microtasks + macrotasks. 100ms covers setTimeout(fn, 10) comfortably.
    await sleep(100);
  } finally {
    console.log = origLog;
  }
  return logged;
}

// ============================================================================
// TASK 1: predictOrder
// ============================================================================
describe('predictOrder', () => {
  it('snippet 1: sync, microtask, macrotask', async () => {
    const actual = await captureOutput(snippet1);
    assert.deepEqual(actual, prediction1);
  });

  it('snippet 2: multiple microtasks queue FIFO', async () => {
    const actual = await captureOutput(snippet2);
    assert.deepEqual(actual, prediction2);
  });

  it('snippet 3: chained .then vs separate .then', async () => {
    const actual = await captureOutput(snippet3);
    assert.deepEqual(actual, prediction3);
  });

  it('snippet 4: setTimeout with different delays', async () => {
    const actual = await captureOutput(snippet4);
    assert.deepEqual(actual, prediction4);
  });

  it('snippet 5: a microtask scheduled inside a macrotask', async () => {
    const actual = await captureOutput(snippet5);
    assert.deepEqual(actual, prediction5);
  });

  it('snippet 6: nested microtasks + macrotasks', async () => {
    const actual = await captureOutput(snippet6);
    assert.deepEqual(actual, prediction6);
  });
});

// ============================================================================
// TASK 2: memoizeLRU
// ============================================================================
describe('memoizeLRU', () => {
  it('caches the result for the same argument', () => {
    let calls = 0;
    const fn = (x) => { calls++; return x * 10; };
    const m = memoizeLRU(fn, 3);

    assert.equal(m(5), 50);
    assert.equal(m(5), 50);
    assert.equal(m(5), 50);
    assert.equal(calls, 1);
  });

  it('caches different arguments separately', () => {
    let calls = 0;
    const fn = (x) => { calls++; return x + 1; };
    const m = memoizeLRU(fn, 3);

    m(1); m(2); m(3);
    m(1); m(2); m(3);
    assert.equal(calls, 3);
  });

  it('evicts the least recently used entry when full', () => {
    let calls = 0;
    const fn = (x) => { calls++; return x; };
    const m = memoizeLRU(fn, 2);

    m(1);   // cache: [1]
    m(2);   // cache: [1, 2]
    m(3);   // full → evict 1 (oldest). cache: [2, 3]

    // 1 was evicted — should be a miss
    m(1);
    assert.equal(calls, 4);  // m(1), m(2), m(3) called fn; m(1) again is a new call
  });

  it('reading an entry refreshes its position (so it is not evicted next)', () => {
    let calls = 0;
    const fn = (x) => { calls++; return x; };
    const m = memoizeLRU(fn, 2);

    m(1);   // cache: [1]
    m(2);   // cache: [1, 2]
    m(1);   // HIT — 1 becomes most recently used. cache: [2, 1]
    m(3);   // full → evict 2 (oldest). cache: [1, 3]

    // 2 was evicted (not 1) — accessing 2 should be a miss
    m(2);
    assert.equal(calls, 4);  // m(1), m(2), m(3), then m(2) again
  });

  it('writing an existing entry also refreshes its position', () => {
    let calls = 0;
    const fn = (x) => { calls++; return x; };
    const m = memoizeLRU(fn, 2);

    m(1);   // cache: [1]
    m(2);   // cache: [1, 2]
    m(1);   // HIT, refreshed. cache: [2, 1]
    m(3);   // evict 2. cache: [1, 3]

    // 1 should still be cached
    assert.equal(calls, 3);
  });

  it('cache size never exceeds maxEntries', () => {
    let calls = 0;
    const fn = (x) => { calls++; return x; };
    const m = memoizeLRU(fn, 3);

    for (let i = 0; i < 100; i++) m(i);
    // Every call was a miss because we never revisited a key.
    assert.equal(calls, 100);

    // The cache currently holds the last 3 keys: 97, 98, 99.
    m(97); m(98); m(99);
    assert.equal(calls, 100);  // all hits — still in cache
  });

  it('maxEntries = 1 keeps only the most recent entry', () => {
    let calls = 0;
    const fn = (x) => { calls++; return x * 2; };
    const m = memoizeLRU(fn, 1);

    m(1);
    m(2);   // evicts 1
    m(1);   // miss (1 was evicted)
    m(2);   // miss (2 was evicted by 1)
    assert.equal(calls, 4);
  });

  it('works with string keys', () => {
    let calls = 0;
    const fn = (s) => { calls++; return s.toUpperCase(); };
    const m = memoizeLRU(fn, 2);

    m('a'); m('b'); m('a');   // 'a' refreshed
    m('c');                   // evicts 'b'
    assert.equal(m('b'), 'B');
    assert.equal(calls, 4);
  });
});

// ============================================================================
// TASK 3: poolFirstAsync
// ============================================================================
describe('poolFirstAsync', () => {
  it('resolves with the first item whose predicate is truthy', async () => {
    const result = await poolFirstAsync(
      [1, 2, 3, 4, 5, 6],
      (n) => Promise.resolve(n > 3),
      2
    );
    assert.equal(result, 4);
  });

  it('returns undefined when no item passes', async () => {
    const result = await poolFirstAsync(
      [1, 2, 3, 4],
      (n) => Promise.resolve(false),
      2
    );
    assert.equal(result, undefined);
  });

  it('returns undefined for an empty array', async () => {
    const result = await poolFirstAsync([], (x) => Promise.resolve(true), 3);
    assert.equal(result, undefined);
  });

  it('finds the FIRST truthy item even with limit = 1', async () => {
    const result = await poolFirstAsync(
      ['a', 'b', 'c', 'd'],
      (s) => Promise.resolve(s === 'c'),
      1
    );
    assert.equal(result, 'c');
  });

  it('never exceeds the concurrency limit', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const result = await poolFirstAsync(
      [1, 2, 3, 4, 5, 6, 7, 8],
      (n) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        return new Promise((resolve) => {
          setTimeout(() => {
            inFlight--;
            resolve(n === 100);  // never matches — must scan everything
          }, 20);
        });
      },
      3
    );
    assert.equal(result, undefined);
    assert.equal(maxInFlight, 3, 'should never exceed limit of 3');
  });

  it('stops processing once a winner is found', async () => {
    let testsAfterWinner = 0;
    let winnerFound = false;
    const result = await poolFirstAsync(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      (n) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (winnerFound) testsAfterWinner++;
            if (n === 4) { winnerFound = true; }
            resolve(n === 4);
          }, 10);
        });
      },
      2
    );
    assert.equal(result, 4);
    // Allow any in-flight tests to complete, then check no NEW tests started.
    await sleep(50);
    assert.equal(
      testsAfterWinner,
      0,
      'no new predicate evaluations should START after the winner resolves'
    );
  });

  it('treats truthy non-boolean values as a match', async () => {
    const result = await poolFirstAsync(
      [0, '', null, 'found', undefined],
      (x) => Promise.resolve(x),
      2
    );
    assert.equal(result, 'found');
  });

  it('works with limit larger than items.length', async () => {
    const result = await poolFirstAsync(
      [1, 2, 3],
      (n) => Promise.resolve(n === 2),
      100
    );
    assert.equal(result, 2);
  });
});

// ============================================================================
// TASK 4: createSequentialQueue
// ============================================================================
describe('createSequentialQueue', () => {
  it('processes items one at a time, in enqueue order', async () => {
    const startTimes = [];
    const q = createSequentialQueue();

    await Promise.all([
      q(1, (n) => {
        startTimes.push({ n, t: Date.now() });
        return new Promise((r) => setTimeout(() => r(n * 10), 30));
      }),
      q(2, (n) => {
        startTimes.push({ n, t: Date.now() });
        return new Promise((r) => setTimeout(() => r(n * 10), 30));
      }),
      q(3, (n) => {
        startTimes.push({ n, t: Date.now() });
        return new Promise((r) => setTimeout(() => r(n * 10), 30));
      }),
    ]);

    // Items started in order 1, 2, 3.
    assert.deepEqual(startTimes.map((s) => s.n), [1, 2, 3]);

    // Each started at least ~30ms after the previous.
    assert(startTimes[1].t - startTimes[0].t >= 25, 'item 2 must wait for item 1');
    assert(startTimes[2].t - startTimes[1].t >= 25, 'item 3 must wait for item 2');
  });

  it('returns each item result to the correct caller', async () => {
    const q = createSequentialQueue();
    const r1 = q('a', (s) => Promise.resolve(s + '1'));
    const r2 = q('b', (s) => Promise.resolve(s + '2'));
    const r3 = q('c', (s) => Promise.resolve(s + '3'));

    assert.equal(await r1, 'a1');
    assert.equal(await r2, 'b2');
    assert.equal(await r3, 'c3');
  });

  it('starts the first item immediately', async () => {
    const q = createSequentialQueue();
    const started = [];
    q(1, (n) => { started.push(n); return Promise.resolve(n); });
    // After a microtask flush, the first item should have started.
    await sleep(5);
    assert.deepEqual(started, [1]);
  });

  it('allows enqueue during processing', async () => {
    const order = [];
    const q = createSequentialQueue();

    // Enqueue first item; while it is processing, enqueue more.
    const p1 = q('a', (s) => {
      order.push('start:' + s);
      // Enqueue B and C while A is still in-flight
      q('b', (s2) => {
        order.push('start:' + s2);
        return Promise.resolve(s2);
      });
      q('c', (s3) => {
        order.push('start:' + s3);
        return Promise.resolve(s3);
      });
      return new Promise((r) => setTimeout(() => { order.push('end:' + s); r(s); }, 20));
    });

    await p1;
    // After p1 finishes, b and c should still be queued — give them time to run.
    await sleep(50);

    assert.deepEqual(order, ['start:a', 'end:a', 'start:b', 'start:c']);
  });

  it('continues processing subsequent items when one rejects', async () => {
    const q = createSequentialQueue();
    const started = [];

    const p1 = q(1, (n) => { started.push(n); return Promise.resolve(n); });
    const p2 = q(2, (n) => { started.push(n); return Promise.reject(new Error('boom')); });
    const p3 = q(3, (n) => { started.push(n); return Promise.resolve(n); });

    // p1 should resolve, p2 should reject, p3 should still run.
    assert.equal(await p1, 1);
    await assert.rejects(() => p2, /boom/);
    assert.equal(await p3, 3);

    // All three were attempted.
    assert.deepEqual(started, [1, 2, 3]);
  });

  it('handles a single-item queue', async () => {
    const q = createSequentialQueue();
    const result = await q(42, (n) => Promise.resolve(n * 2));
    assert.equal(result, 84);
  });
});

// ============================================================================
// TASK 5: createLatch
// ============================================================================
describe('createLatch', () => {
  it('wait() resolves after countDown is called enough times', async () => {
    const latch = createLatch(3);
    let resolved = false;
    latch.wait().then(() => { resolved = true; });

    await sleep(5);
    assert.equal(resolved, false, 'should not resolve before count reaches 0');

    latch.countDown();
    latch.countDown();
    await sleep(5);
    assert.equal(resolved, false, 'should not resolve with count = 1');

    latch.countDown();
    await sleep(5);
    assert.equal(resolved, true, 'should resolve when count reaches 0');
  });

  it('multiple wait() calls all resolve', async () => {
    const latch = createLatch(2);
    let count = 0;
    latch.wait().then(() => count++);
    latch.wait().then(() => count++);
    latch.wait().then(() => count++);

    latch.countDown(2);
    await sleep(5);
    assert.equal(count, 3);
  });

  it('wait() called after count is already 0 resolves immediately', async () => {
    const latch = createLatch(1);
    latch.countDown();

    let resolved = false;
    latch.wait().then(() => { resolved = true; });
    await sleep(5);
    assert.equal(resolved, true);
  });

  it('createLatch(0) resolves wait() on the next microtask', async () => {
    const latch = createLatch(0);
    let resolved = false;
    latch.wait().then(() => { resolved = true; });
    await sleep(5);
    assert.equal(resolved, true);
  });

  it('countDown(n) decrements by n', async () => {
    const latch = createLatch(5);
    let resolved = false;
    latch.wait().then(() => { resolved = true; });

    latch.countDown(3);
    await sleep(5);
    assert.equal(resolved, false);

    latch.countDown(2);  // total 5
    await sleep(5);
    assert.equal(resolved, true);
  });

  it('countDown past zero still resolves waiters', async () => {
    const latch = createLatch(2);
    let resolved = false;
    latch.wait().then(() => { resolved = true; });

    latch.countDown(10);  // count goes negative
    await sleep(5);
    assert.equal(resolved, true);
  });

  it('works when countDown is called synchronously right after creation', async () => {
    const latch = createLatch(2);
    latch.countDown();
    latch.countDown();

    let resolved = false;
    latch.wait().then(() => { resolved = true; });
    await sleep(5);
    assert.equal(resolved, true);
  });
});
