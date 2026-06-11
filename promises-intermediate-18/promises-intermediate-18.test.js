import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  reduceAsync,
  timeoutPromise,
  someAsync,
  everyAsync,
  waterfall,
  attempt,
} from './promises-intermediate-18.js';

// ============================================================================
// TASK 1: reduceAsync
// ============================================================================
describe('reduceAsync', () => {
  it('sums numbers sequentially', async () => {
    const items = [1, 2, 3, 4];
    const asyncSum = (acc, item) => Promise.resolve(acc + item);
    const result = await reduceAsync(items, asyncSum, 0);
    assert.equal(result, 10);
  });

  it('concatenates strings', async () => {
    const words = ['hello', 'world'];
    const asyncJoin = (acc, word) => Promise.resolve(acc + ' ' + word);
    const result = await reduceAsync(words, asyncJoin, '');
    assert.equal(result, ' hello world');
  });

  it('returns initialValue for empty array', async () => {
    const result = await reduceAsync([], (acc, item) => Promise.resolve(acc + item), 0);
    assert.equal(result, 0);
  });

  it('processes items sequentially (not in parallel)', async () => {
    const order = [];
    const items = ['a', 'b', 'c'];
    const track = (acc, item) => new Promise((r) => {
      order.push('start ' + item);
      setTimeout(() => {
        order.push('end ' + item);
        r([...acc, item]);
      }, 30);
    });

    const result = await reduceAsync(items, track, []);
    assert.deepEqual(result, ['a', 'b', 'c']);
    assert.deepEqual(order, [
      'start a', 'end a',
      'start b', 'end b',
      'start c', 'end c',
    ]);
  });

  it('stops and rejects when fn rejects', async () => {
    const items = [1, 2, 3];
    let callCount = 0;
    const failOnTwo = (acc, n) => {
      callCount++;
      if (n === 2) return Promise.reject(new Error('failed on 2'));
      return Promise.resolve(acc + n);
    };

    await assert.rejects(
      () => reduceAsync(items, failOnTwo, 0),
      { message: 'failed on 2' }
    );
    assert.equal(callCount, 2);
  });

  it('works with object accumulation', async () => {
    const items = [
      { name: 'a', value: 1 },
      { name: 'b', value: 2 },
      { name: 'c', value: 3 },
    ];
    const buildObj = (acc, item) => {
      acc[item.name] = item.value;
      return Promise.resolve(acc);
    };
    const result = await reduceAsync(items, buildObj, {});
    assert.deepEqual(result, { a: 1, b: 2, c: 3 });
  });
});

// ============================================================================
// TASK 2: timeoutPromise
// ============================================================================
describe('timeoutPromise', () => {
  it('resolves when promise settles within time limit', async () => {
    const fast = Promise.resolve('quick');
    const result = await timeoutPromise(fast, 1000);
    assert.equal(result, 'quick');
  });

  it('rejects with "timed out" when promise is too slow', async () => {
    const slow = new Promise((r) => setTimeout(() => r('done'), 200));
    await assert.rejects(
      () => timeoutPromise(slow, 50),
      { message: 'timed out' }
    );
  });

  it('rejects with original error when promise rejects quickly', async () => {
    const fails = Promise.reject(new Error('connection lost'));
    await assert.rejects(
      () => timeoutPromise(fails, 1000),
      { message: 'connection lost' }
    );
  });

  it('resolves when promise finishes exactly at the boundary', async () => {
    const medium = new Promise((r) => setTimeout(() => r('ok'), 50));
    const result = await timeoutPromise(medium, 200);
    assert.equal(result, 'ok');
  });

  it('times out when delay is slightly less than promise time', async () => {
    const slow = new Promise((r) => setTimeout(() => r('done'), 200));
    await assert.rejects(
      () => timeoutPromise(slow, 30),
      { message: 'timed out' }
    );
  });
});

// ============================================================================
// TASK 3: someAsync
// ============================================================================
describe('someAsync', () => {
  it('returns true when at least one item passes', async () => {
    const result = await someAsync([1, 2, 3, 4], (n) => Promise.resolve(n > 3));
    assert.equal(result, true);
  });

  it('returns false when no items pass', async () => {
    const result = await someAsync([1, 2, 3], (n) => Promise.resolve(n > 10));
    assert.equal(result, false);
  });

  it('returns false for empty array', async () => {
    const result = await someAsync([], (n) => Promise.resolve(true));
    assert.equal(result, false);
  });

  it('short-circuits and stops checking after first match', async () => {
    const order = [];
    const items = [1, 2, 3, 4, 5];
    const track = (n) => new Promise((r) => {
      order.push(n);
      r(n > 2);
    });

    const result = await someAsync(items, track);
    assert.equal(result, true);
    assert.deepEqual(order, [1, 2, 3]); // stopped after finding 3
  });

  it('returns true when first item passes', async () => {
    const result = await someAsync([5, 1, 2], (n) => Promise.resolve(n > 3));
    assert.equal(result, true);
  });

  it('rejects when predicateFn rejects', async () => {
    const items = [1, 2, 3];
    const failOnTwo = (n) => {
      if (n === 2) return Promise.reject(new Error('predicate failed'));
      return Promise.resolve(n > 5);
    };
    await assert.rejects(
      () => someAsync(items, failOnTwo),
      { message: 'predicate failed' }
    );
  });
});

// ============================================================================
// TASK 4: everyAsync
// ============================================================================
describe('everyAsync', () => {
  it('returns true when all items pass', async () => {
    const result = await everyAsync([2, 4, 6], (n) => Promise.resolve(n % 2 === 0));
    assert.equal(result, true);
  });

  it('returns false when one item fails', async () => {
    const result = await everyAsync([2, 3, 6], (n) => Promise.resolve(n % 2 === 0));
    assert.equal(result, false);
  });

  it('returns true for empty array', async () => {
    const result = await everyAsync([], (n) => Promise.resolve(true));
    assert.equal(result, true);
  });

  it('returns true when all items match a complex condition', async () => {
    const users = [
      { name: 'Alice', active: true },
      { name: 'Bob', active: true },
    ];
    const result = await everyAsync(users, (u) => Promise.resolve(u.active));
    assert.equal(result, true);
  });

  it('returns false when one user is inactive', async () => {
    const users = [
      { name: 'Alice', active: true },
      { name: 'Bob', active: false },
      { name: 'Carol', active: true },
    ];
    const result = await everyAsync(users, (u) => Promise.resolve(u.active));
    assert.equal(result, false);
  });

  it('rejects when predicate rejects', async () => {
    const items = [1, 2, 3];
    const failOnTwo = (n) => {
      if (n === 2) return Promise.reject(new Error('predicate failed'));
      return Promise.resolve(true);
    };
    await assert.rejects(
      () => everyAsync(items, failOnTwo),
      { message: 'predicate failed' }
    );
  });
});

// ============================================================================
// TASK 5: waterfall
// ============================================================================
describe('waterfall', () => {
  it('chains functions passing results forward', async () => {
    const addOne = (x) => Promise.resolve(x + 1);
    const double = (x) => Promise.resolve(x * 2);
    const subtract = (x) => Promise.resolve(x - 3);

    const result = await waterfall([addOne, double, subtract], 5);
    // 5 → 6 → 12 → 9
    assert.equal(result, 9);
  });

  it('returns initialValue for empty array', async () => {
    const result = await waterfall([], 42);
    assert.equal(result, 42);
  });

  it('works with single function', async () => {
    const shout = (s) => Promise.resolve(s + '!');
    const result = await waterfall([shout], 'hello');
    assert.equal(result, 'hello!');
  });

  it('works with string transformations', async () => {
    const upper = (s) => Promise.resolve(s.toUpperCase());
    const addPrefix = (s) => Promise.resolve('PRE: ' + s);
    const reverse = (s) => Promise.resolve([...s].reverse().join(''));

    const result = await waterfall([upper, addPrefix, reverse], 'hello');
    // "hello" → "HELLO" → "PRE: HELLO" → "OLLEH :ERP"
    assert.equal(result, 'OLLEH :ERP');
  });

  it('stops and rejects when a function rejects', async () => {
    const addOne = (x) => Promise.resolve(x + 1);
    const fail = (x) => Promise.reject(new Error('boom'));
    const neverReached = (x) => Promise.resolve(x * 2);

    await assert.rejects(
      () => waterfall([addOne, fail, neverReached], 5),
      { message: 'boom' }
    );
  });

  it('runs functions sequentially (not in parallel)', async () => {
    const order = [];
    const fns = [
      (x) => new Promise((r) => {
        order.push('start f1');
        setTimeout(() => { order.push('end f1'); r(x + 1); }, 30);
      }),
      (x) => new Promise((r) => {
        order.push('start f2');
        setTimeout(() => { order.push('end f2'); r(x * 2); }, 30);
      }),
    ];

    const result = await waterfall(fns, 5);
    assert.equal(result, 12);
    assert.deepEqual(order, [
      'start f1', 'end f1',
      'start f2', 'end f2',
    ]);
  });
});

// ============================================================================
// TASK 6: attempt
// ============================================================================
describe('attempt', () => {
  it('returns ok:true with value on success', async () => {
    const safeFn = attempt(() => Promise.resolve(42));
    const result = await safeFn();
    assert.deepEqual(result, { ok: true, value: 42 });
  });

  it('returns ok:false with error on rejection', async () => {
    const safeFn = attempt(() => Promise.reject(new Error('oops')));
    const result = await safeFn();
    assert.equal(result.ok, false);
    assert.ok(result.error instanceof Error);
    assert.equal(result.error.message, 'oops');
  });

  it('passes arguments through to fn', async () => {
    const safeAdd = attempt((a, b) => Promise.resolve(a + b));
    const result = await safeAdd(3, 4);
    assert.deepEqual(result, { ok: true, value: 7 });
  });

  it('works with JSON parse success', async () => {
    const safeParse = attempt((json) => {
      return Promise.resolve(JSON.parse(json));
    });
    const result = await safeParse('{"a":1}');
    assert.deepEqual(result, { ok: true, value: { a: 1 } });
  });

  it('catches JSON parse errors', async () => {
    const safeParse = attempt((json) => {
      return Promise.resolve(JSON.parse(json));
    });
    const result = await safeParse('invalid json');
    assert.equal(result.ok, false);
    assert.ok(result.error instanceof SyntaxError);
  });

  it('never rejects even when fn rejects', async () => {
    const safeFn = attempt(() => Promise.reject(new Error('never seen')));
    // This should resolve, not reject
    const result = await safeFn();
    assert.equal(result.ok, false);
    assert.equal(result.error.message, 'never seen');
  });
});
