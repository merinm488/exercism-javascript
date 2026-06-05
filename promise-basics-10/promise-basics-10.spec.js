import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  countResults,
  asyncFilter,
  fetchWithFallback,
  buildLookup,
} from './promise-basics-10';

process.on('unhandledRejection', () => {});

describe('Task 1: countResults', () => {
  test('counts successes and failures', async () => {
    const urls = ['/a', '/bad', '/c', '/also-bad'];
    const fetchFn = (url) => {
      if (url.startsWith('/bad') || url === '/also-bad')
        return Promise.reject(new Error('nope'));
      return Promise.resolve('ok');
    };
    const result = await countResults(urls, fetchFn);
    expect(result).toEqual({ success: 2, failed: 2 });
  });

  test('returns zeros for empty array', async () => {
    const result = await countResults([], () => Promise.resolve('ok'));
    expect(result).toEqual({ success: 0, failed: 0 });
  });

  test('all succeed', async () => {
    const result = await countResults(
      ['/a', '/b'],
      (url) => Promise.resolve('ok')
    );
    expect(result).toEqual({ success: 2, failed: 0 });
  });

  test('all fail', async () => {
    const result = await countResults(
      ['/a', '/b'],
      () => Promise.reject(new Error('err'))
    );
    expect(result).toEqual({ success: 0, failed: 2 });
  });
});

describe('Task 2: asyncFilter', () => {
  test('filters even numbers', async () => {
    const nums = [1, 2, 3, 4, 5, 6];
    const isEven = (n) => Promise.resolve(n % 2 === 0);
    const result = await asyncFilter(nums, isEven);
    expect(result).toEqual([2, 4, 6]);
  });

  test('returns empty array for empty input', async () => {
    const result = await asyncFilter([], (n) => Promise.resolve(true));
    expect(result).toEqual([]);
  });

  test('filters long words', async () => {
    const words = ['hello', 'hi', 'hey', 'yo'];
    const isLong = (w) => Promise.resolve(w.length > 2);
    const result = await asyncFilter(words, isLong);
    expect(result).toEqual(['hello', 'hey']);
  });

  test('keeps all when all pass', async () => {
    const result = await asyncFilter([1, 2, 3], () => Promise.resolve(true));
    expect(result).toEqual([1, 2, 3]);
  });

  test('removes all when none pass', async () => {
    const result = await asyncFilter([1, 2, 3], () => Promise.resolve(false));
    expect(result).toEqual([]);
  });

  test('processes truly sequentially', async () => {
    const order = [];
    const items = ['a', 'b', 'c'];
    const slowTest = (item) =>
      new Promise((resolve) => {
        setTimeout(() => {
          order.push(item);
          resolve(item !== 'b');
        }, 20);
      });
    const result = await asyncFilter(items, slowTest);
    expect(result).toEqual(['a', 'c']);
    expect(order).toEqual(['a', 'b', 'c']);
  });
});

describe('Task 3: fetchWithFallback', () => {
  test('uses fallback for failed fetches', async () => {
    const items = [
      { key: 'name', url: '/name', fallback: 'Unknown' },
      { key: 'age', url: '/age', fallback: 0 },
      { key: 'city', url: '/error', fallback: 'N/A' },
    ];
    const fetchFn = (url) => {
      if (url === '/error') return Promise.reject(new Error('fail'));
      return Promise.resolve(url.slice(1));
    };
    const result = await fetchWithFallback(items, fetchFn);
    expect(result).toEqual({ name: 'name', age: 'age', city: 'N/A' });
  });

  test('returns empty object for empty array', async () => {
    const result = await fetchWithFallback([], () => Promise.resolve('x'));
    expect(result).toEqual({});
  });

  test('all succeed, fallbacks not used', async () => {
    const items = [
      { key: 'a', url: '/a', fallback: 'fb-a' },
      { key: 'b', url: '/b', fallback: 'fb-b' },
    ];
    const fetchFn = (url) => Promise.resolve(url.toUpperCase());
    const result = await fetchWithFallback(items, fetchFn);
    expect(result).toEqual({ a: '/A', b: '/B' });
  });

  test('all fail, all use fallbacks', async () => {
    const items = [
      { key: 'x', url: '/x', fallback: 100 },
      { key: 'y', url: '/y', fallback: 200 },
    ];
    const fetchFn = () => Promise.reject(new Error('nope'));
    const result = await fetchWithFallback(items, fetchFn);
    expect(result).toEqual({ x: 100, y: 200 });
  });
});

describe('Task 4: buildLookup', () => {
  test('builds lookup from names', async () => {
    const names = ['alice', 'bob'];
    const lookupFn = (name) =>
      Promise.resolve({ key: name, value: name.length });
    const result = await buildLookup(names, lookupFn);
    expect(result).toEqual({ alice: 5, bob: 3 });
  });

  test('returns empty object for empty array', async () => {
    const result = await buildLookup([], (n) =>
      Promise.resolve({ key: n, value: n })
    );
    expect(result).toEqual({});
  });

  test('builds country lookup', async () => {
    const codes = ['US', 'UK'];
    const countryLookup = (code) =>
      Promise.resolve({
        key: code,
        value: code === 'US' ? 'United States' : 'United Kingdom',
      });
    const result = await buildLookup(codes, countryLookup);
    expect(result).toEqual({ US: 'United States', UK: 'United Kingdom' });
  });

  test('processes truly sequentially', async () => {
    const order = [];
    const items = ['a', 'b', 'c'];
    const slowLookup = (item) =>
      new Promise((resolve) => {
        setTimeout(() => {
          order.push(item);
          resolve({ key: item, value: item.toUpperCase() });
        }, 20);
      });
    const result = await buildLookup(items, slowLookup);
    expect(order).toEqual(['a', 'b', 'c']);
    expect(result).toEqual({ a: 'A', b: 'B', c: 'C' });
  });

  test('handles single item', async () => {
    const result = await buildLookup(['test'], (s) =>
      Promise.resolve({ key: s, value: s.length })
    );
    expect(result).toEqual({ test: 4 });
  });
});
