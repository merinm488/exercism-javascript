import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  firstSuccessful,
  asyncFind,
  asyncSome,
  asyncEvery,
  fetchThenProcess,
  fetchBestAndProcess,
} from './promise-basics-11';

process.on('unhandledRejection', () => {});

describe('Task 1: firstSuccessful', () => {
  test('returns first successful result', async () => {
    const urls = ['/a', '/b', '/c'];
    const fetchFn = (url) => {
      if (url === '/a') return Promise.reject(new Error('fail'));
      return Promise.resolve(url.slice(1));
    };
    const result = await firstSuccessful(urls, fetchFn);
    expect(result).toBe('b');
  });

  test('first one succeeds immediately', async () => {
    const result = await firstSuccessful(['/a'], (url) =>
      Promise.resolve(url)
    );
    expect(result).toBe('/a');
  });

  test('all fail rejects with AggregateError', async () => {
    const urls = ['/a', '/b'];
    const fetchFn = () => Promise.reject(new Error('fail'));
    await expect(firstSuccessful(urls, fetchFn)).rejects.toThrow();
  });

  test('empty array rejects', async () => {
    await expect(
      firstSuccessful([], () => Promise.resolve('ok'))
    ).rejects.toThrow();
  });
});

describe('Task 2: asyncFind', () => {
  test('finds first even number', async () => {
    const nums = [1, 3, 4, 6];
    const isEven = (n) => Promise.resolve(n % 2 === 0);
    const result = await asyncFind(nums, isEven);
    expect(result).toBe(4);
  });

  test('returns undefined when nothing matches', async () => {
    const nums = [1, 3, 5];
    const isEven = (n) => Promise.resolve(n % 2 === 0);
    const result = await asyncFind(nums, isEven);
    expect(result).toBeUndefined();
  });

  test('empty array returns undefined', async () => {
    const result = await asyncFind([], (n) => Promise.resolve(true));
    expect(result).toBeUndefined();
  });

  test('stops at first match (early termination)', async () => {
    const tested = [];
    const items = [1, 2, 3, 4, 5];
    const testFn = (item) => {
      tested.push(item);
      return Promise.resolve(item >= 3);
    };
    const result = await asyncFind(items, testFn);
    expect(result).toBe(3);
    expect(tested).toEqual([1, 2, 3]);
  });

  test('first item matches', async () => {
    const result = await asyncFind([5, 3, 1], (n) =>
      Promise.resolve(n > 4)
    );
    expect(result).toBe(5);
  });
});

describe('Task 3: asyncSome', () => {
  test('returns true when one passes', async () => {
    const nums = [1, 3, 4, 5];
    const isEven = (n) => Promise.resolve(n % 2 === 0);
    const result = await asyncSome(nums, isEven);
    expect(result).toBe(true);
  });

  test('returns false when none pass', async () => {
    const nums = [1, 3, 5];
    const isEven = (n) => Promise.resolve(n % 2 === 0);
    const result = await asyncSome(nums, isEven);
    expect(result).toBe(false);
  });

  test('empty array returns false', async () => {
    const result = await asyncSome([], (n) => Promise.resolve(true));
    expect(result).toBe(false);
  });

  test('stops at first match (early termination)', async () => {
    const tested = [];
    const items = [1, 3, 4, 6, 8];
    const testFn = (item) => {
      tested.push(item);
      return Promise.resolve(item % 2 === 0);
    };
    const result = await asyncSome(items, testFn);
    expect(result).toBe(true);
    expect(tested).toEqual([1, 3, 4]);
  });

  test('all pass returns true', async () => {
    const result = await asyncSome([2, 4, 6], (n) =>
      Promise.resolve(n % 2 === 0)
    );
    expect(result).toBe(true);
  });
});

describe('Task 4: asyncEvery', () => {
  test('returns true when all pass', async () => {
    const nums = [2, 4, 6];
    const isEven = (n) => Promise.resolve(n % 2 === 0);
    const result = await asyncEvery(nums, isEven);
    expect(result).toBe(true);
  });

  test('returns false when one fails', async () => {
    const nums = [2, 3, 6];
    const isEven = (n) => Promise.resolve(n % 2 === 0);
    const result = await asyncEvery(nums, isEven);
    expect(result).toBe(false);
  });

  test('empty array returns true', async () => {
    const result = await asyncEvery([], (n) => Promise.resolve(true));
    expect(result).toBe(true);
  });

  test('stops at first failure (early termination)', async () => {
    const tested = [];
    const items = [2, 4, 3, 6, 8];
    const testFn = (item) => {
      tested.push(item);
      return Promise.resolve(item % 2 === 0);
    };
    const result = await asyncEvery(items, testFn);
    expect(result).toBe(false);
    expect(tested).toEqual([2, 4, 3]);
  });

  test('single item passes', async () => {
    const result = await asyncEvery([2], (n) =>
      Promise.resolve(n % 2 === 0)
    );
    expect(result).toBe(true);
  });

  test('single item fails', async () => {
    const result = await asyncEvery([3], (n) =>
      Promise.resolve(n % 2 === 0)
    );
    expect(result).toBe(false);
  });
});

describe('Task 5: fetchThenProcess', () => {
  test('fetches in parallel then processes sequentially', async () => {
    const urls = ['/a', '/b', '/c'];
    const fetchFn = (url) => Promise.resolve(url.slice(1));
    const processFn = (data) => Promise.resolve(data.toUpperCase());
    const result = await fetchThenProcess(urls, fetchFn, processFn);
    expect(result).toEqual(['A', 'B', 'C']);
  });

  test('empty urls returns empty array', async () => {
    const result = await fetchThenProcess(
      [],
      () => Promise.resolve(''),
      (x) => Promise.resolve(x)
    );
    expect(result).toEqual([]);
  });

  test('processes truly sequentially after parallel fetch', async () => {
    const order = [];
    const urls = ['/a', '/b', '/c'];
    const fetchFn = (url) => Promise.resolve(url.slice(1));
    const slowProcess = (data) =>
      new Promise((resolve) => {
        setTimeout(() => {
          order.push(data);
          resolve(data.toUpperCase());
        }, 20);
      });
    const result = await fetchThenProcess(urls, fetchFn, slowProcess);
    expect(result).toEqual(['A', 'B', 'C']);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  test('transform numbers', async () => {
    const urls = ['/5', '/10', '/15'];
    const fetchFn = (url) => Promise.resolve(Number(url.slice(1)));
    const double = (n) => Promise.resolve(n * 2);
    const result = await fetchThenProcess(urls, fetchFn, double);
    expect(result).toEqual([10, 20, 30]);
  });
});

describe('Task 6: fetchBestAndProcess', () => {
  test('uses first working source then builds object', async () => {
    const sources = ['/fail1', '/fail2', '/ok'];
    const fetchFn = (url) => {
      if (url.startsWith('/fail')) return Promise.reject(new Error('down'));
      return Promise.resolve({ prefix: 'data-' });
    };
    const items = ['name', 'age'];
    const lookupFn = (item, sourceData) =>
      Promise.resolve({ key: item, value: sourceData.prefix + item });
    const result = await fetchBestAndProcess(sources, fetchFn, items, lookupFn);
    expect(result).toEqual({ name: 'data-name', age: 'data-age' });
  });

  test('all sources fail rejects', async () => {
    const sources = ['/a', '/b'];
    const fetchFn = () => Promise.reject(new Error('down'));
    await expect(
      fetchBestAndProcess(sources, fetchFn, [], () =>
        Promise.resolve({ key: '', value: '' })
      )
    ).rejects.toThrow();
  });

  test('empty items returns empty object', async () => {
    const sources = ['/ok'];
    const fetchFn = () => Promise.resolve({ data: 'test' });
    const result = await fetchBestAndProcess(
      sources,
      fetchFn,
      [],
      () => Promise.resolve({ key: '', value: '' })
    );
    expect(result).toEqual({});
  });

  test('processes sequentially after finding source', async () => {
    const order = [];
    const sources = ['/ok'];
    const fetchFn = () => Promise.resolve({});
    const items = ['a', 'b', 'c'];
    const slowLookup = (item, sourceData) =>
      new Promise((resolve) => {
        setTimeout(() => {
          order.push(item);
          resolve({ key: item, value: item.toUpperCase() });
        }, 20);
      });
    const result = await fetchBestAndProcess(
      sources,
      fetchFn,
      items,
      slowLookup
    );
    expect(order).toEqual(['a', 'b', 'c']);
    expect(result).toEqual({ a: 'A', b: 'B', c: 'C' });
  });

  test('first source works immediately', async () => {
    const sources = ['/fast'];
    const fetchFn = (url) => Promise.resolve({ multiplier: 10 });
    const items = ['x', 'y'];
    const lookupFn = (item, sourceData) =>
      Promise.resolve({
        key: item,
        value: item.charCodeAt(0) * sourceData.multiplier,
      });
    const result = await fetchBestAndProcess(
      sources,
      fetchFn,
      items,
      lookupFn
    );
    expect(result).toEqual({ x: 1200, y: 1210 });
  });
});
