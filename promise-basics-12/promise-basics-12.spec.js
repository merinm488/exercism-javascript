import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  safeFetchAll,
  retryUntil,
  sequentialMapSkipErrors,
  retryFetchThenProcess,
  fetchBestThenParallel,
  fetchSummary,
} from './promise-basics-12';

process.on('unhandledRejection', () => {});

describe('Task 1: safeFetchAll', () => {
  test('returns only successful results', async () => {
    const urls = ['/a', '/bad', '/c'];
    const fetchFn = (url) => {
      if (url === '/bad') return Promise.reject(new Error('fail'));
      return Promise.resolve(url.slice(1));
    };
    const result = await safeFetchAll(urls, fetchFn);
    expect(result).toEqual(['a', 'c']);
  });

  test('all succeed returns all results', async () => {
    const urls = ['/a', '/b', '/c'];
    const fetchFn = (url) => Promise.resolve(url.slice(1));
    const result = await safeFetchAll(urls, fetchFn);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('all fail returns empty array', async () => {
    const urls = ['/x', '/y'];
    const fetchFn = () => Promise.reject(new Error('nope'));
    const result = await safeFetchAll(urls, fetchFn);
    expect(result).toEqual([]);
  });

  test('empty array returns empty array', async () => {
    const result = await safeFetchAll([], () => Promise.resolve('ok'));
    expect(result).toEqual([]);
  });

  test('preserves order of successful results', async () => {
    const urls = ['/a', '/fail1', '/c', '/fail2', '/e'];
    const fetchFn = (url) => {
      if (url.startsWith('/fail')) return Promise.reject(new Error('fail'));
      return Promise.resolve(url.slice(1));
    };
    const result = await safeFetchAll(urls, fetchFn);
    expect(result).toEqual(['a', 'c', 'e']);
  });

  test('single success among failures', async () => {
    const urls = ['/bad1', '/ok', '/bad2'];
    const fetchFn = (url) => {
      if (url === '/ok') return Promise.resolve('found');
      return Promise.reject(new Error('fail'));
    };
    const result = await safeFetchAll(urls, fetchFn);
    expect(result).toEqual(['found']);
  });
});

describe('Task 2: retryUntil', () => {
  test('returns when condition passes on first try', async () => {
    const result = await retryUntil(
      () => Promise.resolve(10),
      (n) => n > 5,
      3
    );
    expect(result).toBe(10);
  });

  test('retries until condition passes', async () => {
    let count = 0;
    const rollDice = () => {
      count++;
      return Promise.resolve(count);
    };
    const result = await retryUntil(rollDice, (n) => n >= 3, 5);
    expect(result).toBe(3);
  });

  test('rejects when all attempts fail condition', async () => {
    await expect(
      retryUntil(() => Promise.resolve(1), (n) => n > 10, 3)
    ).rejects.toThrow();
  });

  test('passes on last attempt', async () => {
    let count = 0;
    const fn = () => {
      count++;
      return Promise.resolve(count);
    };
    const result = await retryUntil(fn, (n) => n >= 3, 3);
    expect(result).toBe(3);
  });

  test('works with string conditions', async () => {
    let count = 0;
    const fn = () => {
      count++;
      return Promise.resolve('attempt ' + count);
    };
    const result = await retryUntil(fn, (s) => s.includes('3'), 5);
    expect(result).toBe('attempt 3');
  });

  test('one attempt means one chance', async () => {
    let count = 0;
    const fn = () => {
      count++;
      return Promise.resolve(count);
    };
    const result = await retryUntil(fn, (n) => n >= 1, 1);
    expect(result).toBe(1);
  });
});

describe('Task 3: sequentialMapSkipErrors', () => {
  test('skips failing items and returns successes', async () => {
    const items = ['hello', 'BAD', 'world'];
    const processFn = (item) => {
      if (item === 'BAD') return Promise.reject(new Error('bad input'));
      return Promise.resolve(item.toUpperCase());
    };
    const result = await sequentialMapSkipErrors(items, processFn);
    expect(result).toEqual(['HELLO', 'WORLD']);
  });

  test('all succeed returns all', async () => {
    const items = ['a', 'b', 'c'];
    const processFn = (item) => Promise.resolve(item.toUpperCase());
    const result = await sequentialMapSkipErrors(items, processFn);
    expect(result).toEqual(['A', 'B', 'C']);
  });

  test('all fail returns empty array', async () => {
    const items = ['x', 'y'];
    const processFn = () => Promise.reject(new Error('nope'));
    const result = await sequentialMapSkipErrors(items, processFn);
    expect(result).toEqual([]);
  });

  test('empty array returns empty array', async () => {
    const result = await sequentialMapSkipErrors([], () => Promise.resolve('ok'));
    expect(result).toEqual([]);
  });

  test('processes sequentially even when skipping', async () => {
    const order = [];
    const items = ['a', 'BAD', 'c'];
    const processFn = (item) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          order.push(item);
          if (item === 'BAD') {
            reject(new Error('fail'));
          } else {
            resolve(item.toUpperCase());
          }
        }, 10);
      });
    };
    const result = await sequentialMapSkipErrors(items, processFn);
    expect(result).toEqual(['A', 'C']);
    expect(order).toEqual(['a', 'BAD', 'c']);
  });

  test('single item success', async () => {
    const result = await sequentialMapSkipErrors(
      ['hello'],
      (item) => Promise.resolve(item + '!')
    );
    expect(result).toEqual(['hello!']);
  });

  test('single item failure returns empty', async () => {
    const result = await sequentialMapSkipErrors(
      ['bad'],
      () => Promise.reject(new Error('fail'))
    );
    expect(result).toEqual([]);
  });
});

describe('Task 4: retryFetchThenProcess', () => {
  test('retries and then processes', async () => {
    let tries = 0;
    const fetchFn = (url) => {
      tries++;
      if (tries < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('data from ' + url);
    };
    const processFn = (data) => Promise.resolve(data.toUpperCase());
    const result = await retryFetchThenProcess('/api', fetchFn, 5, processFn);
    expect(result).toBe('DATA FROM /API');
  });

  test('succeeds on first try', async () => {
    const fetchFn = (url) => Promise.resolve('quick ' + url);
    const processFn = (data) => Promise.resolve(data + '!');
    const result = await retryFetchThenProcess('/api', fetchFn, 3, processFn);
    expect(result).toBe('quick /api!');
  });

  test('exhausts all retries rejects', async () => {
    const fetchFn = () => Promise.reject(new Error('always fails'));
    const processFn = (data) => Promise.resolve(data);
    await expect(
      retryFetchThenProcess('/api', fetchFn, 2, processFn)
    ).rejects.toThrow();
  });

  test('transforms numeric data', async () => {
    let tries = 0;
    const fetchFn = (url) => {
      tries++;
      if (tries < 2) return Promise.reject(new Error('retry'));
      return Promise.resolve(5);
    };
    const processFn = (n) => Promise.resolve(n * 3);
    const result = await retryFetchThenProcess('/num', fetchFn, 3, processFn);
    expect(result).toBe(15);
  });

  test('empty string result processed correctly', async () => {
    const fetchFn = () => Promise.resolve('');
    const processFn = (data) => Promise.resolve(data || 'default');
    const result = await retryFetchThenProcess('/empty', fetchFn, 1, processFn);
    expect(result).toBe('default');
  });
});

describe('Task 5: fetchBestThenParallel', () => {
  test('finds source and fetches items in parallel', async () => {
    const sources = ['/fail', '/ok'];
    const fetchFn = (url) => {
      if (url === '/fail') return Promise.reject(new Error('down'));
      return Promise.resolve({ multiplier: 10 });
    };
    const items = ['a', 'b'];
    const lookupFn = (item, src) =>
      Promise.resolve(item.charCodeAt(0) * src.multiplier);
    const result = await fetchBestThenParallel(sources, fetchFn, items, lookupFn);
    expect(result).toEqual({ a: 970, b: 980 });
  });

  test('all sources fail rejects', async () => {
    const sources = ['/a', '/b'];
    const fetchFn = () => Promise.reject(new Error('down'));
    await expect(
      fetchBestThenParallel(sources, fetchFn, [], () => Promise.resolve(''))
    ).rejects.toThrow();
  });

  test('empty items returns empty object', async () => {
    const sources = ['/ok'];
    const fetchFn = () => Promise.resolve({ data: 'test' });
    const result = await fetchBestThenParallel(
      sources,
      fetchFn,
      [],
      () => Promise.resolve('')
    );
    expect(result).toEqual({});
  });

  test('fetches items in parallel not sequentially', async () => {
    const sources = ['/ok'];
    const fetchFn = () => Promise.resolve({ factor: 2 });
    const items = ['x', 'y', 'z'];
    const start = Date.now();
    const slowLookup = (item, src) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(item + ':' + src.factor);
        }, 50);
      });
    const result = await fetchBestThenParallel(
      sources,
      fetchFn,
      items,
      slowLookup
    );
    const elapsed = Date.now() - start;
    // Parallel: should take ~50ms, not ~150ms
    expect(elapsed).toBeLessThan(120);
    expect(result).toEqual({ x: 'x:2', y: 'y:2', z: 'z:2' });
  });

  test('first source works immediately', async () => {
    const sources = ['/fast'];
    const fetchFn = (url) => Promise.resolve({ prefix: 'hello-' });
    const items = ['world'];
    const lookupFn = (item, src) =>
      Promise.resolve(src.prefix + item);
    const result = await fetchBestThenParallel(sources, fetchFn, items, lookupFn);
    expect(result).toEqual({ world: 'hello-world' });
  });
});

describe('Task 6: fetchSummary', () => {
  test('categorizes mixed results', async () => {
    const urls = ['/a', '/bad', '/c'];
    const fetchFn = (url) => {
      if (url === '/bad') return Promise.reject(new Error('server error'));
      return Promise.resolve(url.slice(1));
    };
    const result = await fetchSummary(urls, fetchFn);
    expect(result).toEqual({ succeeded: ['a', 'c'], failed: ['server error'] });
  });

  test('all succeed', async () => {
    const urls = ['/a', '/b'];
    const fetchFn = (url) => Promise.resolve(url.slice(1));
    const result = await fetchSummary(urls, fetchFn);
    expect(result).toEqual({ succeeded: ['a', 'b'], failed: [] });
  });

  test('all fail', async () => {
    const urls = ['/x', '/y'];
    const fetchFn = () => Promise.reject(new Error('down'));
    const result = await fetchSummary(urls, fetchFn);
    expect(result).toEqual({ succeeded: [], failed: ['down', 'down'] });
  });

  test('empty array', async () => {
    const result = await fetchSummary([], () => Promise.resolve('ok'));
    expect(result).toEqual({ succeeded: [], failed: [] });
  });

  test('single success', async () => {
    const result = await fetchSummary(
      ['/a'],
      (url) => Promise.resolve(url.slice(1))
    );
    expect(result).toEqual({ succeeded: ['a'], failed: [] });
  });

  test('single failure', async () => {
    const result = await fetchSummary(
      ['/bad'],
      () => Promise.reject(new Error('error msg'))
    );
    expect(result).toEqual({ succeeded: [], failed: ['error msg'] });
  });
});
