import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  withTimeout,
  sequentialFilter,
  retryCapped,
  firstResolved,
} from './promise-basics-8';

process.on('unhandledRejection', () => {});

describe('Task 1: withTimeout', () => {
  test('returns value when fn resolves within timeout', async () => {
    const fast = () => Promise.resolve('quick');
    const result = await withTimeout(fast, 100);
    expect(result).toBe('quick');
  });

  test('rejects with Timed out when fn is too slow', async () => {
    const slow = () => new Promise(resolve => {
      setTimeout(() => resolve('late'), 200);
    });
    await expect(withTimeout(slow, 50)).rejects.toThrow('Timed out');
  });

  test('returns value if fn resolves exactly at the boundary', async () => {
    const fn = () => new Promise(resolve => {
      setTimeout(() => resolve('just in time'), 30);
    });
    const result = await withTimeout(fn, 100);
    expect(result).toBe('just in time');
  });

  test('propagates rejection from fn if it rejects before timeout', async () => {
    const fails = () => Promise.reject(new Error('boom'));
    await expect(withTimeout(fails, 100)).rejects.toThrow('boom');
  });
});

describe('Task 2: sequentialFilter', () => {
  test('filters items based on async test', async () => {
    const items = [1, 2, 3, 4, 5];
    const isBig = (n) => Promise.resolve(n > 3);
    const result = await sequentialFilter(items, isBig);
    expect(result).toEqual([4, 5]);
  });

  test('returns all items when all pass', async () => {
    const items = ['a', 'b', 'c'];
    const alwaysTrue = () => Promise.resolve(true);
    const result = await sequentialFilter(items, alwaysTrue);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('returns empty array when none pass', async () => {
    const items = [1, 2, 3];
    const alwaysFalse = () => Promise.resolve(false);
    const result = await sequentialFilter(items, alwaysFalse);
    expect(result).toEqual([]);
  });

  test('handles empty array', async () => {
    const result = await sequentialFilter([], () => Promise.resolve(true));
    expect(result).toEqual([]);
  });

  test('processes truly sequentially', async () => {
    const order = [];
    const items = ['a', 'b', 'c'];
    const testFn = (item) => new Promise(resolve => {
      setTimeout(() => {
        order.push(item);
        resolve(item !== 'b');
      }, 20);
    });
    const result = await sequentialFilter(items, testFn);
    expect(result).toEqual(['a', 'c']);
    expect(order).toEqual(['a', 'b', 'c']);
  });
});

describe('Task 3: retryCapped', () => {
  test('succeeds on first try', async () => {
    const fn = () => Promise.resolve('ok');
    const result = await retryCapped(fn, 3, 50, 200);
    expect(result).toBe('ok');
  });

  test('succeeds after retries', async () => {
    let count = 0;
    const flaky = () => {
      count++;
      if (count < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('got it');
    };
    const result = await retryCapped(flaky, 5, 50, 200);
    expect(result).toBe('got it');
    expect(count).toBe(3);
  });

  test('fails after all attempts exhausted', async () => {
    let count = 0;
    const alwaysFails = () => {
      count++;
      return Promise.reject(new Error('nope'));
    };
    await expect(retryCapped(alwaysFails, 3, 50, 200)).rejects.toThrow('nope');
    expect(count).toBe(3);
  });

  test('caps delay at maxDelay', async () => {
    let count = 0;
    const timestamps = [];
    const flaky = () => {
      timestamps.push(Date.now());
      count++;
      if (count < 4) return Promise.reject(new Error('not yet'));
      return Promise.resolve('done');
    };
    await retryCapped(flaky, 5, 100, 150);
    // 1st retry: wait 100ms, 2nd retry: wait 150ms (capped from 200), 3rd retry: wait 150ms (capped from 300)
    const gap1 = timestamps[1] - timestamps[0];
    const gap2 = timestamps[2] - timestamps[1];
    const gap3 = timestamps[3] - timestamps[2];
    expect(gap1).toBeGreaterThanOrEqual(80);
    expect(gap2).toBeGreaterThanOrEqual(130);
    expect(gap3).toBeGreaterThanOrEqual(130);
  });

  test('works with single attempt', async () => {
    const fn = () => Promise.resolve('one shot');
    const result = await retryCapped(fn, 1, 50, 200);
    expect(result).toBe('one shot');
  });
});

describe('Task 4: firstResolved', () => {
  test('returns first resolved value', async () => {
    const fns = [
      () => Promise.reject(new Error('a')),
      () => Promise.reject(new Error('b')),
      () => Promise.resolve('found'),
    ];
    const result = await firstResolved(fns);
    expect(result).toBe('found');
  });

  test('returns first function result if it resolves', async () => {
    const fns = [
      () => Promise.resolve('immediate'),
      () => Promise.resolve('also works'),
    ];
    const result = await firstResolved(fns);
    expect(result).toBe('immediate');
  });

  test('rejects when all functions reject', async () => {
    const fns = [
      () => Promise.reject(new Error('x')),
      () => Promise.reject(new Error('y')),
      () => Promise.reject(new Error('z')),
    ];
    await expect(firstResolved(fns)).rejects.toThrow('All failed');
  });

  test('rejects on empty array', async () => {
    await expect(firstResolved([])).rejects.toThrow('All failed');
  });

  test('tries truly sequentially', async () => {
    const order = [];
    const fns = [
      () => { order.push(1); return Promise.reject(new Error('no')); },
      () => { order.push(2); return Promise.resolve('yes'); },
      () => { order.push(3); return Promise.resolve('also yes'); },
    ];
    const result = await firstResolved(fns);
    expect(result).toBe('yes');
    expect(order).toEqual([1, 2]);
  });

  test('works with single function that resolves', async () => {
    const result = await firstResolved([() => Promise.resolve(42)]);
    expect(result).toBe(42);
  });

  test('works with single function that rejects', async () => {
    await expect(firstResolved([() => Promise.reject(new Error('no'))])).rejects.toThrow('All failed');
  });
});
