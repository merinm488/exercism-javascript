import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  retryWithBackoff,
  promiseMemoize,
  withTimeout,
  fallbackChain,
  asyncQueue,
  settleAll,
} from './promises-intermediate-16.js';

// ============================================================================
// TASK 1: retryWithBackoff
// ============================================================================
describe('retryWithBackoff', () => {
  it('resolves immediately on first success', async () => {
    const result = await retryWithBackoff(
      () => Promise.resolve('ok'),
      3,
      10
    );
    assert.equal(result, 'ok');
  });

  it('retries and succeeds on later attempt', async () => {
    let attempts = 0;
    const fn = () => {
      attempts++;
      if (attempts < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('success');
    };
    const result = await retryWithBackoff(fn, 5, 10);
    assert.equal(result, 'success');
    assert.equal(attempts, 3);
  });

  it('rejects with last error after all retries exhausted', async () => {
    await assert.rejects(
      () => retryWithBackoff(
        () => Promise.reject(new Error('always fails')),
        2,
        5
      ),
      { message: 'always fails' }
    );
  });

  it('increases delay exponentially', async () => {
    let attempts = 0;
    const start = Date.now();
    const fn = () => {
      attempts++;
      if (attempts < 4) return Promise.reject(new Error('retry'));
      return Promise.resolve('done');
    };
    await retryWithBackoff(fn, 5, 50);
    const elapsed = Date.now() - start;
    // Delays: 50 + 100 + 200 = 350ms minimum
    assert.ok(elapsed >= 300, `expected >= 300ms, got ${elapsed}ms`);
  });
});

// ============================================================================
// TASK 2: promiseMemoize
// ============================================================================
describe('promiseMemoize', () => {
  it('caches results for same arguments', async () => {
    let callCount = 0;
    const fn = (x) => {
      callCount++;
      return Promise.resolve(x * 2);
    };
    const memoized = promiseMemoize(fn);

    const a = await memoized(5);
    const b = await memoized(5);
    assert.equal(a, 10);
    assert.equal(b, 10);
    assert.equal(callCount, 1);
  });

  it('calls fn again for different arguments', async () => {
    let callCount = 0;
    const fn = (x) => {
      callCount++;
      return Promise.resolve(x * 2);
    };
    const memoized = promiseMemoize(fn);

    await memoized(5);
    await memoized(10);
    assert.equal(callCount, 2);
  });

  it('caches multiple different argument sets', async () => {
    let callCount = 0;
    const fn = (x, y) => {
      callCount++;
      return Promise.resolve(x + y);
    };
    const memoized = promiseMemoize(fn);

    const a = await memoized(1, 2);
    const b = await memoized(3, 4);
    const c = await memoized(1, 2);
    assert.equal(a, 3);
    assert.equal(b, 7);
    assert.equal(c, 3);
    assert.equal(callCount, 2);
  });

  it('works with no arguments', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.resolve('result');
    };
    const memoized = promiseMemoize(fn);

    await memoized();
    await memoized();
    assert.equal(callCount, 1);
  });
});

// ============================================================================
// TASK 3: withTimeout
// ============================================================================
describe('withTimeout', () => {
  it('resolves if promise settles before timeout', async () => {
    const fast = new Promise((r) => setTimeout(() => r('done'), 20));
    const result = await withTimeout(fast, 100);
    assert.equal(result, 'done');
  });

  it('rejects with timeout if promise is too slow', async () => {
    const slow = new Promise((r) => setTimeout(() => r('done'), 200));
    await assert.rejects(
      () => withTimeout(slow, 30),
      { message: 'timeout' }
    );
  });

  it('rejects with original error if promise rejects quickly', async () => {
    const failing = Promise.reject(new Error('network error'));
    await assert.rejects(
      () => withTimeout(failing, 1000),
      { message: 'network error' }
    );
  });

  it('resolves immediately for already-resolved promise', async () => {
    const result = await withTimeout(Promise.resolve(42), 100);
    assert.equal(result, 42);
  });
});

// ============================================================================
// TASK 4: fallbackChain
// ============================================================================
describe('fallbackChain', () => {
  it('returns result of first successful function', async () => {
    const result = await fallbackChain([
      () => Promise.resolve('first'),
    ]);
    assert.equal(result, 'first');
  });

  it('skips rejected functions and returns first success', async () => {
    const result = await fallbackChain([
      () => Promise.reject(new Error('fail 1')),
      () => Promise.reject(new Error('fail 2')),
      () => Promise.resolve('third'),
    ]);
    assert.equal(result, 'third');
  });

  it('rejects with last error if all fail', async () => {
    await assert.rejects(
      () => fallbackChain([
        () => Promise.reject(new Error('fail 1')),
        () => Promise.reject(new Error('fail 2')),
        () => Promise.reject(new Error('final fail')),
      ]),
      { message: 'final fail' }
    );
  });

  it('rejects with error for empty array', async () => {
    await assert.rejects(
      () => fallbackChain([]),
      { message: 'no functions provided' }
    );
  });
});

// ============================================================================
// TASK 5: asyncQueue
// ============================================================================
describe('asyncQueue', () => {
  it('processes tasks and returns results', async () => {
    const queue = asyncQueue();
    const result = await queue.enqueue(() => Promise.resolve('done'));
    assert.equal(result, 'done');
  });

  it('processes tasks sequentially', async () => {
    const queue = asyncQueue();
    const order = [];

    queue.enqueue(() => new Promise((r) => setTimeout(() => {
      order.push('a');
      r(1);
    }, 50)));

    queue.enqueue(() => new Promise((r) => setTimeout(() => {
      order.push('b');
      r(2);
    }, 10)));

    // Wait for both to finish
    await new Promise((r) => setTimeout(r, 120));

    assert.deepEqual(order, ['a', 'b']);
  });

  it('returns correct results for each task', async () => {
    const queue = asyncQueue();

    const r1 = queue.enqueue(() => Promise.resolve(10));
    const r2 = queue.enqueue(() => Promise.resolve(20));
    const r3 = queue.enqueue(() => Promise.resolve(30));

    assert.equal(await r1, 10);
    assert.equal(await r2, 20);
    assert.equal(await r3, 30);
  });

  it('continues processing after a failed task', async () => {
    const queue = asyncQueue();

    await assert.rejects(
      () => queue.enqueue(() => Promise.reject(new Error('fail'))),
      { message: 'fail' }
    );

    const result = await queue.enqueue(() => Promise.resolve('recovered'));
    assert.equal(result, 'recovered');
  });
});

// ============================================================================
// TASK 6: settleAll
// ============================================================================
describe('settleAll', () => {
  it('collects all fulfilled results', async () => {
    const results = await settleAll([
      () => Promise.resolve('a'),
      () => Promise.resolve('b'),
    ]);
    assert.deepEqual(results, [
      { status: 'fulfilled', value: 'a' },
      { status: 'fulfilled', value: 'b' },
    ]);
  });

  it('collects all rejected results', async () => {
    const results = await settleAll([
      () => Promise.reject(new Error('fail 1')),
      () => Promise.reject(new Error('fail 2')),
    ]);
    assert.equal(results.length, 2);
    assert.equal(results[0].status, 'rejected');
    assert.equal(results[0].reason.message, 'fail 1');
    assert.equal(results[1].status, 'rejected');
    assert.equal(results[1].reason.message, 'fail 2');
  });

  it('collects mixed results in order', async () => {
    const results = await settleAll([
      () => Promise.resolve('ok'),
      () => Promise.reject(new Error('fail')),
      () => Promise.resolve(42),
    ]);
    assert.equal(results[0].status, 'fulfilled');
    assert.equal(results[0].value, 'ok');
    assert.equal(results[1].status, 'rejected');
    assert.equal(results[1].reason.message, 'fail');
    assert.equal(results[2].status, 'fulfilled');
    assert.equal(results[2].value, 42);
  });

  it('returns empty array for empty input', async () => {
    const results = await settleAll([]);
    assert.deepEqual(results, []);
  });
});
