import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  tapAsync,
  partitionAsync,
  mapWithRetry,
  delayChain,
  findAsync,
  safeMap,
} from './promises-intermediate-19.js';

// ============================================================================
// TASK 1: tapAsync
// ============================================================================
describe('tapAsync', () => {
  it('returns the original value when fn resolves', async () => {
    const result = await tapAsync(5, (n) => Promise.resolve(n * 10));
    assert.equal(result, 5);
  });

  it('returns original string, ignoring fn result', async () => {
    const result = await tapAsync('hello', (s) => Promise.resolve(s.toUpperCase()));
    assert.equal(result, 'hello');
  });

  it('returns original object reference', async () => {
    const obj = { name: 'test' };
    const result = await tapAsync(obj, (o) => Promise.resolve({ ...o, extra: true }));
    assert.strictEqual(result, obj);
  });

  it('rejects when fn rejects', async () => {
    await assert.rejects(
      () => tapAsync(10, () => Promise.reject(new Error('side effect failed'))),
      { message: 'side effect failed' }
    );
  });

  it('waits for fn to complete before resolving', async () => {
    let completed = false;
    const result = await tapAsync(42, () => new Promise((r) => {
      setTimeout(() => { completed = true; r('done'); }, 30);
    }));
    assert.equal(result, 42);
    assert.equal(completed, true);
  });
});

// ============================================================================
// TASK 2: partitionAsync
// ============================================================================
describe('partitionAsync', () => {
  it('splits even and odd numbers', async () => {
    const [matches, nonMatches] = await partitionAsync(
      [1, 2, 3, 4, 5],
      (n) => Promise.resolve(n % 2 === 0)
    );
    assert.deepEqual(matches, [2, 4]);
    assert.deepEqual(nonMatches, [1, 3, 5]);
  });

  it('splits numbers greater than 3', async () => {
    const [matches, nonMatches] = await partitionAsync(
      [1, 2, 3, 4, 5],
      (n) => Promise.resolve(n > 3)
    );
    assert.deepEqual(matches, [4, 5]);
    assert.deepEqual(nonMatches, [1, 2, 3]);
  });

  it('returns two empty arrays for empty input', async () => {
    const [matches, nonMatches] = await partitionAsync(
      [],
      (n) => Promise.resolve(true)
    );
    assert.deepEqual(matches, []);
    assert.deepEqual(nonMatches, []);
  });

  it('all match returns all in first array', async () => {
    const [matches, nonMatches] = await partitionAsync(
      [1, 2, 3],
      () => Promise.resolve(true)
    );
    assert.deepEqual(matches, [1, 2, 3]);
    assert.deepEqual(nonMatches, []);
  });

  it('none match returns all in second array', async () => {
    const [matches, nonMatches] = await partitionAsync(
      [1, 2, 3],
      () => Promise.resolve(false)
    );
    assert.deepEqual(matches, []);
    assert.deepEqual(nonMatches, [1, 2, 3]);
  });

  it('works with objects', async () => {
    const users = [
      { name: 'Alice', active: true },
      { name: 'Bob', active: false },
      { name: 'Carol', active: true },
    ];
    const [active, inactive] = await partitionAsync(
      users,
      (u) => Promise.resolve(u.active)
    );
    assert.deepEqual(active, [{ name: 'Alice', active: true }, { name: 'Carol', active: true }]);
    assert.deepEqual(inactive, [{ name: 'Bob', active: false }]);
  });
});

// ============================================================================
// TASK 3: mapWithRetry
// ============================================================================
describe('mapWithRetry', () => {
  it('maps items that succeed on first try', async () => {
    const result = await mapWithRetry(
      [1, 2, 3],
      (n) => Promise.resolve(n * 2),
      2
    );
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('returns empty array for empty input', async () => {
    const result = await mapWithRetry([], (n) => Promise.resolve(n), 3);
    assert.deepEqual(result, []);
  });

  it('retries failed items and succeeds on retry', async () => {
    let attempts = 0;
    const flaky = (n) => {
      attempts++;
      if (attempts % 2 === 1) return Promise.reject(new Error('flaky'));
      return Promise.resolve(n * 2);
    };

    const result = await mapWithRetry([1, 2], flaky, 1);
    assert.deepEqual(result, [2, 4]);
  });

  it('rejects when max retries exceeded', async () => {
    const alwaysFail = (n) => Promise.reject(new Error('always fails'));
    await assert.rejects(
      () => mapWithRetry([1], alwaysFail, 2),
      { message: 'always fails' }
    );
  });

  it('processes items sequentially', async () => {
    const order = [];
    const items = ['a', 'b', 'c'];
    const track = (item) => new Promise((r) => {
      order.push('start ' + item);
      setTimeout(() => {
        order.push('end ' + item);
        r(item.toUpperCase());
      }, 20);
    });

    const result = await mapWithRetry(items, track, 0);
    assert.deepEqual(result, ['A', 'B', 'C']);
    assert.deepEqual(order, [
      'start a', 'end a',
      'start b', 'end b',
      'start c', 'end c',
    ]);
  });

  it('retries correct number of times', async () => {
    let callCount = 0;
    const failTwice = (n) => {
      callCount++;
      if (callCount <= 2) return Promise.reject(new Error('not yet'));
      return Promise.resolve(n * 3);
    };

    const result = await mapWithRetry([5], failTwice, 3);
    assert.equal(result[0], 15);
    assert.equal(callCount, 3); // 1 initial + 2 retries
  });
});

// ============================================================================
// TASK 4: delayChain
// ============================================================================
describe('delayChain', () => {
  it('collects results from all functions', async () => {
    const fns = [
      () => Promise.resolve('a'),
      () => Promise.resolve('b'),
      () => Promise.resolve('c'),
    ];
    const result = await delayChain(fns, 10);
    assert.deepEqual(result, ['a', 'b', 'c']);
  });

  it('returns empty array for empty input', async () => {
    const result = await delayChain([], 100);
    assert.deepEqual(result, []);
  });

  it('works with a single function', async () => {
    const result = await delayChain([() => Promise.resolve(42)], 50);
    assert.deepEqual(result, [42]);
  });

  it('waits between calls (not before first)', async () => {
    const timestamps = [];
    const fns = [
      () => { timestamps.push(Date.now()); return Promise.resolve(1); },
      () => { timestamps.push(Date.now()); return Promise.resolve(2); },
      () => { timestamps.push(Date.now()); return Promise.resolve(3); },
    ];

    const result = await delayChain(fns, 60);
    assert.deepEqual(result, [1, 2, 3]);
    // Gap between first and second should be ~60ms
    assert.ok(timestamps[1] - timestamps[0] >= 50);
    // Gap between second and third should be ~60ms
    assert.ok(timestamps[2] - timestamps[1] >= 50);
  });

  it('stops and rejects when a function rejects', async () => {
    const fns = [
      () => Promise.resolve('ok'),
      () => Promise.reject(new Error('boom')),
      () => Promise.resolve('never'),
    ];
    await assert.rejects(
      () => delayChain(fns, 10),
      { message: 'boom' }
    );
  });

  it('runs sequentially (not in parallel)', async () => {
    const order = [];
    const fns = [
      () => new Promise((r) => {
        order.push('start f1');
        setTimeout(() => { order.push('end f1'); r(1); }, 30);
      }),
      () => new Promise((r) => {
        order.push('start f2');
        setTimeout(() => { order.push('end f2'); r(2); }, 30);
      }),
    ];
    const result = await delayChain(fns, 10);
    assert.deepEqual(result, [1, 2]);
    assert.deepEqual(order, [
      'start f1', 'end f1',
      'start f2', 'end f2',
    ]);
  });
});

// ============================================================================
// TASK 5: findAsync
// ============================================================================
describe('findAsync', () => {
  it('returns the first matching item', async () => {
    const result = await findAsync([1, 2, 3, 4], (n) => Promise.resolve(n > 2));
    assert.equal(result, 3);
  });

  it('returns undefined when no items match', async () => {
    const result = await findAsync([1, 2, 3], (n) => Promise.resolve(n > 10));
    assert.equal(result, undefined);
  });

  it('returns undefined for empty array', async () => {
    const result = await findAsync([], () => Promise.resolve(true));
    assert.equal(result, undefined);
  });

  it('returns first item when it matches', async () => {
    const result = await findAsync([5, 1, 2], (n) => Promise.resolve(n > 3));
    assert.equal(result, 5);
  });

  it('short-circuits and stops after first match', async () => {
    const order = [];
    const items = [1, 2, 3, 4, 5];
    const track = (n) => new Promise((r) => {
      order.push(n);
      r(n > 2);
    });

    const result = await findAsync(items, track);
    assert.equal(result, 3);
    assert.deepEqual(order, [1, 2, 3]); // stopped after finding 3
  });

  it('works with objects', async () => {
    const users = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Carol', age: 35 },
    ];
    const result = await findAsync(users, (u) => Promise.resolve(u.age >= 30));
    assert.deepEqual(result, { name: 'Bob', age: 30 });
  });
});

// ============================================================================
// TASK 6: safeMap
// ============================================================================
describe('safeMap', () => {
  it('maps all items when all succeed', async () => {
    const result = await safeMap([1, 2, 3], (n) => Promise.resolve(n * 2), 0);
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('returns empty array for empty input', async () => {
    const result = await safeMap([], (n) => Promise.resolve(n), 0);
    assert.deepEqual(result, []);
  });

  it('replaces failures with fallback value', async () => {
    const failOnTwo = (n) => {
      if (n === 2) return Promise.reject(new Error('fail'));
      return Promise.resolve(n * 10);
    };
    const result = await safeMap([1, 2, 3], failOnTwo, -1);
    assert.deepEqual(result, [10, -1, 30]);
  });

  it('replaces all failures when all items fail', async () => {
    const alwaysFail = () => Promise.reject(new Error('nope'));
    const result = await safeMap([1, 2, 3], alwaysFail, 'fallback');
    assert.deepEqual(result, ['fallback', 'fallback', 'fallback']);
  });

  it('never rejects even when all items fail', async () => {
    const alwaysFail = () => Promise.reject(new Error('boom'));
    const result = await safeMap([1, 2], alwaysFail, null);
    assert.deepEqual(result, [null, null]);
  });

  it('works with object fallback', async () => {
    const failOnThree = (n) => {
      if (n === 3) return Promise.reject(new Error('err'));
      return Promise.resolve({ value: n });
    };
    const result = await safeMap([1, 2, 3], failOnThree, { value: 0 });
    assert.deepEqual(result, [{ value: 1 }, { value: 2 }, { value: 0 }]);
  });
});
