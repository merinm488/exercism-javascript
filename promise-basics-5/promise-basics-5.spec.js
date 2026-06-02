import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  firstSuccess,
  withTimeout,
  retry,
  fetchParallel,
  fetchSequential,
  robustFetch,
} from './promise-basics-5';

// Prevent Node from crashing on unhandled rejections from rejected
// test promises when functions haven't been implemented yet.
process.on('unhandledRejection', () => {});

describe('Task 1: firstSuccess (Promise.any)', () => {
  test('resolves with the first fulfilled promise', async () => {
    const promises = [
      Promise.reject(new Error('fail')),
      Promise.resolve('success'),
      Promise.resolve('also success'),
    ];
    const result = await firstSuccess(promises);
    expect(result).toBe('success');
  });

  test('resolves when all promises fulfill', async () => {
    const promises = [
      Promise.resolve(10),
      Promise.resolve(20),
    ];
    const result = await firstSuccess(promises);
    expect(result).toBe(10);
  });

  test('rejects with AggregateError when all reject', async () => {
    const promises = [
      Promise.reject(new Error('a')),
      Promise.reject(new Error('b')),
    ];
    try {
      await firstSuccess(promises);
      fail('Should have rejected');
    } catch (err) {
      expect(err).toBeInstanceOf(AggregateError);
      expect(err.errors).toHaveLength(2);
      expect(err.errors[0].message).toBe('a');
      expect(err.errors[1].message).toBe('b');
    }
  });

  test('resolves with single promise value', async () => {
    const result = await firstSuccess([Promise.resolve('only one')]);
    expect(result).toBe('only one');
  });
});

describe('Task 2: withTimeout', () => {
  test('resolves when promise settles before timeout', async () => {
    const fast = new Promise(resolve =>
      setTimeout(() => resolve('quick'), 10)
    );
    const result = await withTimeout(fast, 1000);
    expect(result).toBe('quick');
  });

  test('rejects with original error when promise rejects before timeout', async () => {
    const fastFail = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('fast error')), 10)
    );
    await expect(withTimeout(fastFail, 1000)).rejects.toThrow('fast error');
  });

  test('rejects with "timeout" when promise is too slow', async () => {
    const slow = new Promise(resolve =>
      setTimeout(() => resolve('late'), 500)
    );
    await expect(withTimeout(slow, 50)).rejects.toThrow('timeout');
  });

  test('works with already resolved promise', async () => {
    const result = await withTimeout(Promise.resolve(42), 100);
    expect(result).toBe(42);
  });
});

describe('Task 3: retry', () => {
  test('succeeds on first try', async () => {
    const fn = () => Promise.resolve('ok');
    const result = await retry(fn, 3);
    expect(result).toBe('ok');
  });

  test('succeeds after retries', async () => {
    let count = 0;
    const flaky = () => {
      count++;
      if (count < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('got it');
    };
    const result = await retry(flaky, 5);
    expect(result).toBe('got it');
    expect(count).toBe(3);
  });

  test('fails after all attempts exhausted', async () => {
    let count = 0;
    const alwaysFails = () => {
      count++;
      return Promise.reject(new Error('nope'));
    };
    await expect(retry(alwaysFails, 3)).rejects.toThrow('nope');
    expect(count).toBe(3);
  });

  test('works with single attempt', async () => {
    const fn = () => Promise.resolve('one shot');
    const result = await retry(fn, 1);
    expect(result).toBe('one shot');
  });
});

describe('Task 4: fetchParallel', () => {
  test('fetches all items in parallel', async () => {
    const items = ['url1', 'url2', 'url3'];
    const fetchFn = (item) => Promise.resolve(item.toUpperCase());
    const results = await fetchParallel(items, fetchFn);
    expect(results).toEqual(['URL1', 'URL2', 'URL3']);
  });

  test('handles single item', async () => {
    const results = await fetchParallel(['only'], (x) => Promise.resolve(x + '!'));
    expect(results).toEqual(['only!']);
  });

  test('handles empty array', async () => {
    const results = await fetchParallel([], (x) => Promise.resolve(x));
    expect(results).toEqual([]);
  });

  test('propagates rejection if any fetch fails', async () => {
    const items = ['ok', 'bad'];
    const fetchFn = (item) => {
      if (item === 'bad') return Promise.reject(new Error('fetch failed'));
      return Promise.resolve(item);
    };
    await expect(fetchParallel(items, fetchFn)).rejects.toThrow('fetch failed');
  });
});

describe('Task 5: fetchSequential', () => {
  test('processes items in order', async () => {
    const items = ['a', 'b', 'c'];
    const order = [];
    const processFn = (item) => {
      order.push(item);
      return Promise.resolve(item.toUpperCase());
    };
    const results = await fetchSequential(items, processFn);
    expect(results).toEqual(['A', 'B', 'C']);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  test('handles single item', async () => {
    const results = await fetchSequential(['x'], (item) => Promise.resolve(item + '!'));
    expect(results).toEqual(['x!']);
  });

  test('handles empty array', async () => {
    const results = await fetchSequential([], (x) => Promise.resolve(x));
    expect(results).toEqual([]);
  });

  test('processes truly sequentially (one at a time)', async () => {
    const timestamps = [];
    const items = ['a', 'b', 'c'];
    const processFn = (item) => {
      return new Promise(resolve => {
        setTimeout(() => {
          timestamps.push(item);
          resolve(item.toUpperCase());
        }, 30);
      });
    };
    const results = await fetchSequential(items, processFn);
    expect(results).toEqual(['A', 'B', 'C']);
    // If sequential, order must be preserved
    expect(timestamps).toEqual(['a', 'b', 'c']);
  });

  test('propagates rejection', async () => {
    const items = ['ok', 'bad'];
    const processFn = (item) => {
      if (item === 'bad') return Promise.reject(new Error('process failed'));
      return Promise.resolve(item);
    };
    await expect(fetchSequential(items, processFn)).rejects.toThrow('process failed');
  });
});

describe('Task 6: robustFetch', () => {
  test('returns resolved value', async () => {
    let logged = null;
    const result = await robustFetch(Promise.resolve(42), 0, (msg) => { logged = msg; });
    expect(result).toBe(42);
    expect(logged).toBe('done');
  });

  test('returns fallback when promise rejects', async () => {
    let logged = null;
    const result = await robustFetch(
      Promise.reject(new Error('fail')),
      'default',
      (msg) => { logged = msg; }
    );
    expect(result).toBe('default');
    expect(logged).toBe('done');
  });

  test('calls logFn even on success', async () => {
    let logged = null;
    await robustFetch(Promise.resolve('hello'), 'fallback', (msg) => { logged = msg; });
    expect(logged).toBe('done');
  });

  test('returns number fallback', async () => {
    let logged = null;
    const result = await robustFetch(
      Promise.reject(new Error('err')),
      -1,
      (msg) => { logged = msg; }
    );
    expect(result).toBe(-1);
    expect(logged).toBe('done');
  });
});
