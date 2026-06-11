import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  withCache,
  composeAsync,
  timeoutWrapper,
  retryWithDelay,
  runQueue,
  transformThenBatch,
} from './promises-intermediate-13';

process.on('unhandledRejection', () => {});

describe('Task 1: withCache', () => {
  test('caches results — does not call fetchFn twice for same key', async () => {
    let callCount = 0;
    const fetchName = (key) => {
      callCount++;
      return Promise.resolve(key.toUpperCase());
    };
    const cached = withCache(fetchName);

    const r1 = await cached('alice');
    expect(r1).toBe('ALICE');
    expect(callCount).toBe(1);

    const r2 = await cached('alice');
    expect(r2).toBe('ALICE');
    expect(callCount).toBe(1); // still 1 — cached!

    const r3 = await cached('bob');
    expect(r3).toBe('BOB');
    expect(callCount).toBe(2);
  });

  test('different keys are cached independently', async () => {
    let callCount = 0;
    const fetch = (key) => {
      callCount++;
      return Promise.resolve('value-' + key);
    };
    const cached = withCache(fetch);

    await cached('x');
    await cached('y');
    await cached('x');
    await cached('y');
    expect(callCount).toBe(2);
  });

  test('works with numeric values', async () => {
    let calls = 0;
    const fetch = (key) => {
      calls++;
      return Promise.resolve(key.length);
    };
    const cached = withCache(fetch);

    expect(await cached('hi')).toBe(2);
    expect(await cached('hello')).toBe(5);
    expect(await cached('hi')).toBe(2);
    expect(calls).toBe(2);
  });

  test('handles rejection — does not cache failures', async () => {
    let calls = 0;
    const fetch = (key) => {
      calls++;
      if (calls < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('ok');
    };
    const cached = withCache(fetch);

    // First call fails
    await expect(cached('key')).rejects.toThrow('not yet');
    expect(calls).toBe(1);

    // Second call also fails (failure was NOT cached)
    await expect(cached('key')).rejects.toThrow('not yet');
    expect(calls).toBe(2);

    // Third call succeeds and gets cached
    const result = await cached('key');
    expect(result).toBe('ok');
    expect(calls).toBe(3);

    // Fourth call returns cached result
    const result2 = await cached('key');
    expect(result2).toBe('ok');
    expect(calls).toBe(3);
  });
});

describe('Task 2: composeAsync', () => {
  test('composes two async functions', async () => {
    const double = (n) => Promise.resolve(n * 2);
    const addTen = (n) => Promise.resolve(n + 10);
    const doubleThenAddTen = composeAsync(double, addTen);

    expect(await doubleThenAddTen(5)).toBe(20);
  });

  test('works with string transformations', async () => {
    const upper = (s) => Promise.resolve(s.toUpperCase());
    const exclaim = (s) => Promise.resolve(s + '!');
    const shout = composeAsync(upper, exclaim);

    expect(await shout('hello')).toBe('HELLO!');
  });

  test('composed function is reusable', async () => {
    const addOne = (n) => Promise.resolve(n + 1);
    const triple = (n) => Promise.resolve(n * 3);
    const addOneThenTriple = composeAsync(addOne, triple);

    expect(await addOneThenTriple(0)).toBe(3);
    expect(await addOneThenTriple(1)).toBe(6);
    expect(await addOneThenTriple(4)).toBe(15);
  });

  test('handles rejection in first function', async () => {
    const fail = () => Promise.reject(new Error('nope'));
    const ok = (x) => Promise.resolve(x);
    const composed = composeAsync(fail, ok);

    await expect(composed('anything')).rejects.toThrow('nope');
  });

  test('handles rejection in second function', async () => {
    const ok = (x) => Promise.resolve(x);
    const fail = () => Promise.reject(new Error('boom'));
    const composed = composeAsync(ok, fail);

    await expect(composed('anything')).rejects.toThrow('boom');
  });
});

describe('Task 3: timeoutWrapper', () => {
  test('resolves if fn completes in time', async () => {
    const fast = () => Promise.resolve('quick');
    const result = await timeoutWrapper(fast, 1000);
    expect(result).toBe('quick');
  });

  test('rejects with "timeout" if fn is too slow', async () => {
    const slow = () =>
      new Promise((resolve) => setTimeout(() => resolve('late'), 500));
    await expect(timeoutWrapper(slow, 50)).rejects.toThrow('timeout');
  });

  test('works when timeout is exactly enough', async () => {
    const medium = () =>
      new Promise((resolve) => setTimeout(() => resolve('ok'), 30));
    const result = await timeoutWrapper(medium, 200);
    expect(result).toBe('ok');
  });

  test('timeout does not affect already-resolved promises', async () => {
    const instant = () => Promise.resolve(42);
    const result = await timeoutWrapper(instant, 0);
    expect(result).toBe(42);
  });
});

describe('Task 4: retryWithDelay', () => {
  test('succeeds on first try', async () => {
    const result = await retryWithDelay(
      () => Promise.resolve('done'),
      3,
      50
    );
    expect(result).toBe('done');
  });

  test('retries with delay and eventually succeeds', async () => {
    let tries = 0;
    const flaky = () => {
      tries++;
      if (tries < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('got it');
    };

    const start = Date.now();
    const result = await retryWithDelay(flaky, 5, 50);
    const elapsed = Date.now() - start;

    expect(result).toBe('got it');
    // At least 2 delays (50ms each) should have happened
    expect(elapsed).toBeGreaterThanOrEqual(80);
  });

  test('rejects when all attempts fail', async () => {
    await expect(
      retryWithDelay(() => Promise.reject(new Error('never')), 3, 10)
    ).rejects.toThrow('never');
  });

  test('respects max attempts', async () => {
    let tries = 0;
    const fn = () => {
      tries++;
      return Promise.reject(new Error('fail'));
    };

    await expect(retryWithDelay(fn, 4, 10)).rejects.toThrow('fail');
    expect(tries).toBe(4);
  });

  test('single attempt — no retry', async () => {
    let tries = 0;
    const fn = () => {
      tries++;
      return Promise.resolve('ok');
    };
    const result = await retryWithDelay(fn, 1, 50);
    expect(result).toBe('ok');
    expect(tries).toBe(1);
  });
});

describe('Task 5: runQueue', () => {
  test('runs tasks sequentially and collects results', async () => {
    const tasks = [
      () => Promise.resolve('first'),
      () => Promise.resolve('second'),
      () => Promise.resolve('third'),
    ];
    const result = await runQueue(tasks);
    expect(result).toEqual(['first', 'second', 'third']);
  });

  test('empty array returns empty array', async () => {
    const result = await runQueue([]);
    expect(result).toEqual([]);
  });

  test('single task', async () => {
    const result = await runQueue([() => Promise.resolve(42)]);
    expect(result).toEqual([42]);
  });

  test('tasks run sequentially not in parallel', async () => {
    const order = [];
    const tasks = [
      () =>
        new Promise((r) =>
          setTimeout(() => {
            order.push('a');
            r('A');
          }, 30)
        ),
      () =>
        new Promise((r) =>
          setTimeout(() => {
            order.push('b');
            r('B');
          }, 10)
        ),
      () =>
        new Promise((r) =>
          setTimeout(() => {
            order.push('c');
            r('C');
          }, 10)
        ),
    ];
    const result = await runQueue(tasks);
    expect(result).toEqual(['A', 'B', 'C']);
    // Sequential: a finishes before b starts, b before c
    expect(order).toEqual(['a', 'b', 'c']);
  });

  test('stops and rejects if any task fails', async () => {
    let thirdCalled = false;
    const tasks = [
      () => Promise.resolve('ok'),
      () => Promise.reject(new Error('boom')),
      () => {
        thirdCalled = true;
        return Promise.resolve('never');
      },
    ];
    await expect(runQueue(tasks)).rejects.toThrow('boom');
    expect(thirdCalled).toBe(false);
  });
});

describe('Task 6: transformThenBatch', () => {
  test('transforms items then batches', async () => {
    const items = ['hello', 'world'];
    const transformFn = (item) => Promise.resolve(item.toUpperCase());
    const batchFn = (arr) => Promise.resolve(arr.join('-'));

    const result = await transformThenBatch(items, transformFn, batchFn);
    expect(result).toBe('HELLO-WORLD');
  });

  test('empty items returns batch result of empty array', async () => {
    const transformFn = (item) => Promise.resolve(item);
    const batchFn = (arr) => Promise.resolve(arr.join(','));

    const result = await transformThenBatch([], transformFn, batchFn);
    expect(result).toBe('');
  });

  test('numeric transforms', async () => {
    const items = [1, 2, 3];
    const transformFn = (n) => Promise.resolve(n * 10);
    const batchFn = (arr) => Promise.resolve(arr.reduce((a, b) => a + b, 0));

    const result = await transformThenBatch(items, transformFn, batchFn);
    expect(result).toBe(60);
  });

  test('transforms sequentially not in parallel', async () => {
    const order = [];
    const items = ['a', 'b', 'c'];
    const transformFn = (item) =>
      new Promise((resolve) => {
        setTimeout(() => {
          order.push(item);
          resolve(item.toUpperCase());
        }, 20);
      });
    const batchFn = (arr) => Promise.resolve(arr.join(''));

    const start = Date.now();
    const result = await transformThenBatch(items, transformFn, batchFn);
    const elapsed = Date.now() - start;

    expect(result).toBe('ABC');
    expect(order).toEqual(['a', 'b', 'c']);
    // Sequential: at least 3 * 20ms = 60ms
    expect(elapsed).toBeGreaterThanOrEqual(50);
  });

  test('batchFn receives all transformed results', async () => {
    const items = ['x', 'y', 'z'];
    const transformFn = (item) => Promise.resolve(item + '!');
    let receivedByBatch = null;
    const batchFn = (arr) => {
      receivedByBatch = arr;
      return Promise.resolve(arr.length);
    };

    const result = await transformThenBatch(items, transformFn, batchFn);
    expect(result).toBe(3);
    expect(receivedByBatch).toEqual(['x!', 'y!', 'z!']);
  });
});
