import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  pollUntil,
  pipeline,
  mapConcurrent,
  batchProcess,
  circuitBreaker,
  firstNFulfilled,
} from './promises-intermediate-15.js';

// ============================================================================
// TASK 1: pollUntil
// ============================================================================
describe('pollUntil', () => {
  it('resolves immediately when condition is met on first try', async () => {
    const result = await pollUntil(
      () => Promise.resolve('ready'),
      (r) => r === 'ready',
      10,
      5
    );
    assert.equal(result, 'ready');
  });

  it('polls until condition is met', async () => {
    let attempts = 0;
    const check = () => {
      attempts++;
      if (attempts < 3) return Promise.resolve('loading');
      return Promise.resolve('ready');
    };
    const result = await pollUntil(check, (r) => r === 'ready', 10, 10);
    assert.equal(result, 'ready');
    assert.equal(attempts, 3);
  });

  it('rejects with "condition not met" if maxAttempts exceeded', async () => {
    await assert.rejects(
      () => pollUntil(
        () => Promise.resolve('nope'),
        (r) => r === 'yes',
        5,
        3
      ),
      { message: 'condition not met' }
    );
  });

  it('propagates rejection from fn', async () => {
    await assert.rejects(
      () => pollUntil(
        () => Promise.reject(new Error('server error')),
        () => true,
        5,
        3
      ),
      { message: 'server error' }
    );
  });
});

// ============================================================================
// TASK 2: pipeline
// ============================================================================
describe('pipeline', () => {
  it('pipes a value through multiple async functions', async () => {
    const double = (n) => Promise.resolve(n * 2);
    const addTen = (n) => Promise.resolve(n + 10);
    const square = (n) => Promise.resolve(n * n);

    const pipe = pipeline([double, addTen, square]);
    // 3 -> 6 -> 16 -> 256
    const result = await pipe(3);
    assert.equal(result, 256);
  });

  it('works with two functions', async () => {
    const double = (n) => Promise.resolve(n * 2);
    const addTen = (n) => Promise.resolve(n + 10);
    const result = await pipeline([double, addTen])(5);
    assert.equal(result, 20);
  });

  it('returns value as-is for empty pipeline', async () => {
    const result = await pipeline([])(42);
    assert.equal(result, 42);
  });

  it('works with single function', async () => {
    const shout = (s) => Promise.resolve(s + '!');
    const result = await pipeline([shout])('hello');
    assert.equal(result, 'hello!');
  });
});

// ============================================================================
// TASK 3: mapConcurrent
// ============================================================================
describe('mapConcurrent', () => {
  it('maps all items with concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5];
    const double = (n) => Promise.resolve(n * 2);
    const result = await mapConcurrent(items, double, 2);
    assert.deepEqual(result, [2, 4, 6, 8, 10]);
  });

  it('returns empty array for empty input', async () => {
    const result = await mapConcurrent([], (x) => Promise.resolve(x), 3);
    assert.deepEqual(result, []);
  });

  it('respects concurrency limit', async () => {
    let running = 0;
    let maxRunning = 0;
    const items = [1, 2, 3, 4, 5, 6];
    const track = (n) => {
      running++;
      if (running > maxRunning) maxRunning = running;
      return new Promise((resolve) => {
        setTimeout(() => {
          running--;
          resolve(n * 10);
        }, 20);
      });
    };

    const result = await mapConcurrent(items, track, 2);
    assert.deepEqual(result, [10, 20, 30, 40, 50, 60]);
    assert.ok(maxRunning <= 2, `max concurrent was ${maxRunning}, expected <= 2`);
  });

  it('works when maxConcurrent > items length', async () => {
    const result = await mapConcurrent([1, 2], (n) => Promise.resolve(n + 1), 10);
    assert.deepEqual(result, [2, 3]);
  });
});

// ============================================================================
// TASK 4: batchProcess
// ============================================================================
describe('batchProcess', () => {
  it('processes items in batches', async () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const doubleBatch = (batch) => Promise.resolve(batch.map((n) => n * 2));
    const result = await batchProcess(items, doubleBatch, 3);
    assert.deepEqual(result, [2, 4, 6, 8, 10, 12, 14]);
  });

  it('returns empty array for empty input', async () => {
    const result = await batchProcess([], (b) => Promise.resolve(b), 3);
    assert.deepEqual(result, []);
  });

  it('handles batchSize larger than items', async () => {
    const result = await batchProcess([1, 2], (b) => Promise.resolve(b), 10);
    assert.deepEqual(result, [1, 2]);
  });

  it('processes batches sequentially', async () => {
    const order = [];
    const trackBatch = (batch) => {
      order.push(batch.length);
      return Promise.resolve(batch);
    };
    await batchProcess([1, 2, 3, 4, 5], trackBatch, 2);
    assert.deepEqual(order, [2, 2, 1]);
  });

  it('handles batchSize of 1', async () => {
    const result = await batchProcess(
      [1, 2, 3],
      (batch) => Promise.resolve(batch.map((n) => n * 10)),
      1
    );
    assert.deepEqual(result, [10, 20, 30]);
  });
});

// ============================================================================
// TASK 5: circuitBreaker
// ============================================================================
describe('circuitBreaker', () => {
  it('passes through successful calls', async () => {
    const fn = () => Promise.resolve('ok');
    const protectedCall = circuitBreaker(fn, 3, 100);
    const result = await protectedCall();
    assert.equal(result, 'ok');
  });

  it('opens after reaching failure threshold', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.reject(new Error('fail ' + callCount));
    };
    const protectedCall = circuitBreaker(fn, 2, 100);

    await assert.rejects(() => protectedCall(), { message: 'fail 1' });
    await assert.rejects(() => protectedCall(), { message: 'fail 2' });
    // Circuit should now be OPEN
    await assert.rejects(() => protectedCall(), { message: 'circuit open' });
  });

  it('resets to half-open after timeout then closes on success', async () => {
    let failCount = 0;
    const fn = () => {
      failCount++;
      if (failCount <= 2) return Promise.reject(new Error('fail'));
      return Promise.resolve('recovered');
    };
    const protectedCall = circuitBreaker(fn, 2, 50);

    await assert.rejects(() => protectedCall(), { message: 'fail' });
    await assert.rejects(() => protectedCall(), { message: 'fail' });
    // Circuit OPEN
    await assert.rejects(() => protectedCall(), { message: 'circuit open' });

    // Wait for reset timeout
    await new Promise((r) => setTimeout(r, 80));

    // HALF_OPEN -> succeeds -> CLOSED
    const result = await protectedCall();
    assert.equal(result, 'recovered');
  });

  it('goes back to open if half-open call fails', async () => {
    const fn = () => Promise.reject(new Error('still down'));
    const protectedCall = circuitBreaker(fn, 1, 50);

    await assert.rejects(() => protectedCall(), { message: 'still down' });
    // Circuit OPEN
    await assert.rejects(() => protectedCall(), { message: 'circuit open' });

    // Wait for reset
    await new Promise((r) => setTimeout(r, 80));

    // HALF_OPEN -> fails -> OPEN again
    await assert.rejects(() => protectedCall(), { message: 'still down' });
    await assert.rejects(() => protectedCall(), { message: 'circuit open' });
  });
});

// ============================================================================
// TASK 6: firstNFulfilled
// ============================================================================
describe('firstNFulfilled', () => {
  it('returns first N results in resolution order', async () => {
    const tasks = [
      () => new Promise((r) => setTimeout(() => r('slow'), 50)),
      () => new Promise((r) => setTimeout(() => r('fast'), 10)),
      () => Promise.reject(new Error('fail')),
      () => new Promise((r) => setTimeout(() => r('medium'), 25)),
    ];
    const result = await firstNFulfilled(tasks, 2);
    assert.equal(result.length, 2);
    assert.ok(result.includes('fast'));
    assert.ok(result.includes('medium'));
  });

  it('resolves with single result for n=1', async () => {
    const tasks = [
      () => Promise.reject(new Error('no')),
      () => Promise.resolve('yes'),
      () => Promise.resolve('also'),
    ];
    const result = await firstNFulfilled(tasks, 1);
    assert.deepEqual(result, ['yes']);
  });

  it('rejects when not enough tasks succeed', async () => {
    const tasks = [
      () => Promise.reject(new Error('a')),
      () => Promise.reject(new Error('b')),
    ];
    await assert.rejects(
      () => firstNFulfilled(tasks, 1),
      { message: 'not enough results' }
    );
  });

  it('handles n equal to total tasks when all succeed', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ];
    const result = await firstNFulfilled(tasks, 3);
    assert.equal(result.length, 3);
    assert.ok(result.includes(1));
    assert.ok(result.includes(2));
    assert.ok(result.includes(3));
  });

  it('rejects early when impossible to get n results', async () => {
    const tasks = [
      () => Promise.resolve('only'),
    ];
    await assert.rejects(
      () => firstNFulfilled(tasks, 2),
      { message: 'not enough results' }
    );
  });
});
