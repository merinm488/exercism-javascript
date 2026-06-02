import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  firstSettled,
  allResults,
  retryWithDelay,
  fetchSuccessful,
  buildObject,
  trySequential,
} from './promise-basics-6';

process.on('unhandledRejection', () => {});

describe('Task 1: firstSettled (Promise.race)', () => {
  test('resolves with the fastest resolving promise', async () => {
    const promises = [
      new Promise(resolve => setTimeout(() => resolve('slow'), 100)),
      new Promise(resolve => setTimeout(() => resolve('fast'), 10)),
    ];
    const result = await firstSettled(promises);
    expect(result).toBe('fast');
  });

  test('rejects if the first to settle rejects', async () => {
    const promises = [
      Promise.reject(new Error('boom')),
      Promise.resolve('too late'),
    ];
    await expect(firstSettled(promises)).rejects.toThrow('boom');
  });

  test('resolves with single promise value', async () => {
    const result = await firstSettled([Promise.resolve('only one')]);
    expect(result).toBe('only one');
  });
});

describe('Task 2: allResults (Promise.allSettled)', () => {
  test('returns fulfilled and rejected results', async () => {
    const fns = [
      () => Promise.resolve(10),
      () => Promise.reject(new Error('bad')),
      () => Promise.resolve(30),
    ];
    const results = await allResults(fns);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({ status: 'fulfilled', value: 10 });
    expect(results[1].status).toBe('rejected');
    expect(results[1].reason.message).toBe('bad');
    expect(results[2]).toEqual({ status: 'fulfilled', value: 30 });
  });

  test('returns all fulfilled when none reject', async () => {
    const fns = [
      () => Promise.resolve('a'),
      () => Promise.resolve('b'),
    ];
    const results = await allResults(fns);
    expect(results).toEqual([
      { status: 'fulfilled', value: 'a' },
      { status: 'fulfilled', value: 'b' },
    ]);
  });

  test('handles empty array', async () => {
    const results = await allResults([]);
    expect(results).toEqual([]);
  });

  test('returns all rejected when none fulfill', async () => {
    const fns = [
      () => Promise.reject(new Error('x')),
      () => Promise.reject(new Error('y')),
    ];
    const results = await allResults(fns);
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('rejected');
    expect(results[1].status).toBe('rejected');
  });
});

describe('Task 3: retryWithDelay', () => {
  test('succeeds on first try', async () => {
    const fn = () => Promise.resolve('ok');
    const result = await retryWithDelay(fn, 3, 50);
    expect(result).toBe('ok');
  });

  test('succeeds after retries', async () => {
    let count = 0;
    const flaky = () => {
      count++;
      if (count < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('got it');
    };
    const result = await retryWithDelay(flaky, 5, 50);
    expect(result).toBe('got it');
    expect(count).toBe(3);
  });

  test('fails after all attempts exhausted', async () => {
    let count = 0;
    const alwaysFails = () => {
      count++;
      return Promise.reject(new Error('nope'));
    };
    await expect(retryWithDelay(alwaysFails, 3, 50)).rejects.toThrow('nope');
    expect(count).toBe(3);
  });

  test('actually delays between retries', async () => {
    let count = 0;
    const start = Date.now();
    const flaky = () => {
      count++;
      if (count < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('done');
    };
    await retryWithDelay(flaky, 5, 100);
    const elapsed = Date.now() - start;
    // Should have waited at least ~200ms (2 delays of 100ms each)
    expect(elapsed).toBeGreaterThanOrEqual(150);
  });

  test('works with single attempt', async () => {
    const fn = () => Promise.resolve('one shot');
    const result = await retryWithDelay(fn, 1, 50);
    expect(result).toBe('one shot');
  });
});

describe('Task 4: fetchSuccessful', () => {
  test('returns only successful results', async () => {
    const items = ['ok1', 'bad', 'ok2'];
    const fetchFn = (item) => {
      if (item === 'bad') return Promise.reject(new Error('fail'));
      return Promise.resolve(item.toUpperCase());
    };
    const results = await fetchSuccessful(items, fetchFn);
    expect(results).toEqual(['OK1', 'OK2']);
  });

  test('returns all when nothing fails', async () => {
    const items = ['a', 'b', 'c'];
    const fetchFn = (item) => Promise.resolve(item + '!');
    const results = await fetchSuccessful(items, fetchFn);
    expect(results).toEqual(['a!', 'b!', 'c!']);
  });

  test('handles empty array', async () => {
    const results = await fetchSuccessful([], (x) => Promise.resolve(x));
    expect(results).toEqual([]);
  });

  test('returns empty when all fail', async () => {
    const items = ['a', 'b'];
    const fetchFn = () => Promise.reject(new Error('fail'));
    const results = await fetchSuccessful(items, fetchFn);
    expect(results).toEqual([]);
  });
});

describe('Task 5: buildObject', () => {
  test('builds object from key-value pairs', async () => {
    const items = [
      { key: 'name', value: 'alice' },
      { key: 'city', value: 'london' },
    ];
    const processFn = (obj) => Promise.resolve(obj.value.toUpperCase());
    const result = await buildObject(items, processFn);
    expect(result).toEqual({ name: 'ALICE', city: 'LONDON' });
  });

  test('handles single item', async () => {
    const items = [{ key: 'x', value: 10 }];
    const processFn = (obj) => Promise.resolve(obj.value * 2);
    const result = await buildObject(items, processFn);
    expect(result).toEqual({ x: 20 });
  });

  test('handles empty array', async () => {
    const result = await buildObject([], (obj) => Promise.resolve(obj.value));
    expect(result).toEqual({});
  });

  test('processes truly sequentially', async () => {
    const order = [];
    const items = [
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
      { key: 'c', value: 3 },
    ];
    const processFn = (obj) => {
      return new Promise(resolve => {
        setTimeout(() => {
          order.push(obj.key);
          resolve(obj.value * 10);
        }, 30);
      });
    };
    const result = await buildObject(items, processFn);
    expect(result).toEqual({ a: 10, b: 20, c: 30 });
    expect(order).toEqual(['a', 'b', 'c']);
  });

  test('propagates rejection', async () => {
    const items = [
      { key: 'ok', value: 1 },
      { key: 'bad', value: 2 },
    ];
    const processFn = (obj) => {
      if (obj.key === 'bad') return Promise.reject(new Error('process failed'));
      return Promise.resolve(obj.value);
    };
    await expect(buildObject(items, processFn)).rejects.toThrow('process failed');
  });
});

describe('Task 6: trySequential', () => {
  test('returns first successful result', async () => {
    const fns = [
      () => Promise.reject(new Error('fail 1')),
      () => Promise.reject(new Error('fail 2')),
      () => Promise.resolve('success'),
      () => Promise.resolve('never reached'),
    ];
    const result = await trySequential(fns);
    expect(result).toBe('success');
  });

  test('succeeds on first try', async () => {
    const fns = [
      () => Promise.resolve('immediate'),
      () => Promise.resolve('never'),
    ];
    const result = await trySequential(fns);
    expect(result).toBe('immediate');
  });

  test('rejects with last error when all fail', async () => {
    const fns = [
      () => Promise.reject(new Error('a')),
      () => Promise.reject(new Error('b')),
    ];
    await expect(trySequential(fns)).rejects.toThrow('b');
  });

  test('rejects with error on empty array', async () => {
    await expect(trySequential([])).rejects.toThrow('No functions to try');
  });

  test('tries functions truly sequentially', async () => {
    const order = [];
    const fns = [
      () => { order.push(1); return Promise.reject(new Error('no')); },
      () => { order.push(2); return Promise.reject(new Error('no')); },
      () => { order.push(3); return Promise.resolve('yes'); },
    ];
    const result = await trySequential(fns);
    expect(result).toBe('yes');
    expect(order).toEqual([1, 2, 3]);
  });

  test('works with single function', async () => {
    const result = await trySequential([() => Promise.resolve('solo')]);
    expect(result).toBe('solo');
  });
});
