import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  retryBackoff,
  parallelSummary,
  sequentialMap,
  findMatching,
} from './promise-basics-7';

process.on('unhandledRejection', () => {});

describe('Task 1: retryBackoff', () => {
  test('succeeds on first try', async () => {
    const fn = () => Promise.resolve('ok');
    const result = await retryBackoff(fn, 3, 50);
    expect(result).toBe('ok');
  });

  test('succeeds after retries', async () => {
    let count = 0;
    const flaky = () => {
      count++;
      if (count < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('got it');
    };
    const result = await retryBackoff(flaky, 5, 50);
    expect(result).toBe('got it');
    expect(count).toBe(3);
  });

  test('fails after all attempts exhausted', async () => {
    let count = 0;
    const alwaysFails = () => {
      count++;
      return Promise.reject(new Error('nope'));
    };
    await expect(retryBackoff(alwaysFails, 3, 50)).rejects.toThrow('nope');
    expect(count).toBe(3);
  });

  test('doubles delay each retry', async () => {
    let count = 0;
    const timestamps = [];
    const flaky = () => {
      timestamps.push(Date.now());
      count++;
      if (count < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('done');
    };
    await retryBackoff(flaky, 5, 50);
    // 1st retry waits 50ms, 2nd retry waits 100ms
    const gap1 = timestamps[1] - timestamps[0];
    const gap2 = timestamps[2] - timestamps[1];
    expect(gap1).toBeGreaterThanOrEqual(40);
    expect(gap2).toBeGreaterThanOrEqual(80);
  });

  test('works with single attempt', async () => {
    const fn = () => Promise.resolve('one shot');
    const result = await retryBackoff(fn, 1, 50);
    expect(result).toBe('one shot');
  });
});

describe('Task 2: parallelSummary', () => {
  test('categorises successes and failures', async () => {
    const items = ['good', 'bad', 'ok'];
    const fetchFn = (item) => {
      if (item === 'bad') return Promise.reject(new Error('failed'));
      return Promise.resolve(item.toUpperCase());
    };
    const result = await parallelSummary(items, fetchFn);
    expect(result.succeeded).toEqual(['GOOD', 'OK']);
    expect(result.failed).toEqual(['failed']);
  });

  test('returns all successes when nothing fails', async () => {
    const items = ['a', 'b', 'c'];
    const fetchFn = (item) => Promise.resolve(item + '!');
    const result = await parallelSummary(items, fetchFn);
    expect(result).toEqual({ succeeded: ['a!', 'b!', 'c!'], failed: [] });
  });

  test('returns all failures when nothing succeeds', async () => {
    const items = ['a', 'b'];
    const fetchFn = () => Promise.reject(new Error('down'));
    const result = await parallelSummary(items, fetchFn);
    expect(result.succeeded).toEqual([]);
    expect(result.failed).toEqual(['down', 'down']);
  });

  test('handles empty array', async () => {
    const result = await parallelSummary([], (x) => Promise.resolve(x));
    expect(result).toEqual({ succeeded: [], failed: [] });
  });
});

describe('Task 3: sequentialMap', () => {
  test('maps all items sequentially', async () => {
    const items = [1, 2, 3];
    const double = (n) => Promise.resolve(n * 2);
    const result = await sequentialMap(items, double);
    expect(result).toEqual([2, 4, 6]);
  });

  test('handles single item', async () => {
    const result = await sequentialMap([5], (n) => Promise.resolve(n + 1));
    expect(result).toEqual([6]);
  });

  test('handles empty array', async () => {
    const result = await sequentialMap([], (x) => Promise.resolve(x));
    expect(result).toEqual([]);
  });

  test('processes truly sequentially', async () => {
    const order = [];
    const items = ['a', 'b', 'c'];
    const processFn = (item) => {
      return new Promise(resolve => {
        setTimeout(() => {
          order.push(item);
          resolve(item.toUpperCase());
        }, 20);
      });
    };
    const result = await sequentialMap(items, processFn);
    expect(result).toEqual(['A', 'B', 'C']);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  test('propagates rejection', async () => {
    const items = [1, 2, 3];
    const failOnTwo = (n) => {
      if (n === 2) return Promise.reject(new Error('boom'));
      return Promise.resolve(n);
    };
    await expect(sequentialMap(items, failOnTwo)).rejects.toThrow('boom');
  });
});

describe('Task 4: findMatching', () => {
  test('returns first result matching condition', async () => {
    const fns = [
      () => Promise.resolve(5),
      () => Promise.resolve(12),
      () => Promise.resolve(8),
    ];
    const isEven = (n) => n % 2 === 0;
    const result = await findMatching(fns, isEven);
    expect(result).toBe(12);
  });

  test('succeeds on first try if condition matches', async () => {
    const fns = [
      () => Promise.resolve(4),
      () => Promise.resolve(6),
    ];
    const isEven = (n) => n % 2 === 0;
    const result = await findMatching(fns, isEven);
    expect(result).toBe(4);
  });

  test('skips rejections and keeps looking', async () => {
    const fns = [
      () => Promise.reject(new Error('no')),
      () => Promise.resolve(7),
      () => Promise.resolve(10),
    ];
    const isTen = (n) => n === 10;
    const result = await findMatching(fns, isTen);
    expect(result).toBe(10);
  });

  test('rejects when no match found', async () => {
    const fns = [
      () => Promise.resolve(1),
      () => Promise.resolve(3),
      () => Promise.resolve(5),
    ];
    const isEven = (n) => n % 2 === 0;
    await expect(findMatching(fns, isEven)).rejects.toThrow('No match found');
  });

  test('rejects on empty array', async () => {
    await expect(findMatching([], () => true)).rejects.toThrow('No match found');
  });

  test('tries truly sequentially', async () => {
    const order = [];
    const fns = [
      () => { order.push(1); return Promise.resolve(1); },
      () => { order.push(2); return Promise.resolve(4); },
      () => { order.push(3); return Promise.resolve(6); },
    ];
    const isEven = (n) => n % 2 === 0;
    const result = await findMatching(fns, isEven);
    expect(result).toBe(4);
    expect(order).toEqual([1, 2]);
  });

  test('works with single function', async () => {
    const result = await findMatching([() => Promise.resolve(42)], (n) => n > 0);
    expect(result).toBe(42);
  });
});
