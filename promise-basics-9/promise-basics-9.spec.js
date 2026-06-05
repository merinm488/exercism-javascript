import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  fetchAsMap,
  buildString,
  fetchWithErrors,
  groupBySequential,
} from './promise-basics-9';

process.on('unhandledRejection', () => {});

describe('Task 1: fetchAsMap', () => {
  test('builds a map from successful and failed fetches', async () => {
    const items = [
      { key: 'user', url: '/user' },
      { key: 'posts', url: '/posts' },
      { key: 'bad', url: '/error' },
    ];
    const fetchFn = (url) => {
      if (url === '/error') return Promise.reject(new Error('fail'));
      return Promise.resolve(url + ' data');
    };
    const result = await fetchAsMap(items, fetchFn);
    expect(result).toEqual({
      user: '/user data',
      posts: '/posts data',
      bad: null,
    });
  });

  test('returns empty object for empty array', async () => {
    const result = await fetchAsMap([], () => Promise.resolve('x'));
    expect(result).toEqual({});
  });

  test('returns all values when all succeed', async () => {
    const items = [
      { key: 'a', url: '/a' },
      { key: 'b', url: '/b' },
    ];
    const fetchFn = (url) => Promise.resolve(url.toUpperCase());
    const result = await fetchAsMap(items, fetchFn);
    expect(result).toEqual({ a: '/A', b: '/B' });
  });

  test('returns all nulls when all fail', async () => {
    const items = [
      { key: 'x', url: '/x' },
      { key: 'y', url: '/y' },
    ];
    const fetchFn = () => Promise.reject(new Error('nope'));
    const result = await fetchAsMap(items, fetchFn);
    expect(result).toEqual({ x: null, y: null });
  });
});

describe('Task 2: buildString', () => {
  test('builds a space-separated string from transformed words', async () => {
    const words = ['hello', 'world', 'today'];
    const upper = (w) => Promise.resolve(w.toUpperCase());
    const result = await buildString(words, upper);
    expect(result).toBe('HELLO WORLD TODAY');
  });

  test('returns empty string for empty array', async () => {
    const result = await buildString([], (w) => Promise.resolve(w));
    expect(result).toBe('');
  });

  test('handles single word', async () => {
    const result = await buildString(['one'], (w) => Promise.resolve(w.toUpperCase()));
    expect(result).toBe('ONE');
  });

  test('processes truly sequentially', async () => {
    const order = [];
    const words = ['a', 'b', 'c'];
    const slowTransform = (w) => new Promise(resolve => {
      setTimeout(() => {
        order.push(w);
        resolve(w.toUpperCase());
      }, 20);
    });
    const result = await buildString(words, slowTransform);
    expect(result).toBe('A B C');
    expect(order).toEqual(['a', 'b', 'c']);
  });
});

describe('Task 3: fetchWithErrors', () => {
  test('resolves with all values when all succeed', async () => {
    const items = ['x', 'y'];
    const fetchFn = (item) => Promise.resolve(item + '!');
    const result = await fetchWithErrors(items, fetchFn);
    expect(result).toEqual(['x!', 'y!']);
  });

  test('rejects with combined error messages when some fail', async () => {
    const items = ['a', 'b', 'c'];
    const fetchFn = (item) => {
      if (item === 'b') return Promise.reject(new Error('bad b'));
      if (item === 'c') return Promise.reject(new Error('bad c'));
      return Promise.resolve(item.toUpperCase());
    };
    await expect(fetchWithErrors(items, fetchFn)).rejects.toThrow('Failed: bad b, bad c');
  });

  test('resolves with empty array for empty input', async () => {
    const result = await fetchWithErrors([], () => Promise.resolve('x'));
    expect(result).toEqual([]);
  });

  test('rejects with single error message when one fails', async () => {
    const items = ['ok', 'bad'];
    const fetchFn = (item) => {
      if (item === 'bad') return Promise.reject(new Error('oops'));
      return Promise.resolve(item);
    };
    await expect(fetchWithErrors(items, fetchFn)).rejects.toThrow('Failed: oops');
  });

  test('rejects when all fail', async () => {
    const items = ['a', 'b'];
    const fetchFn = () => Promise.reject(new Error('err'));
    await expect(fetchWithErrors(items, fetchFn)).rejects.toThrow('Failed: err, err');
  });
});

describe('Task 4: groupBySequential', () => {
  test('groups numbers by even/odd', async () => {
    const nums = [1, 2, 3, 4, 5, 6];
    const parity = (n) => Promise.resolve(n % 2 === 0 ? 'even' : 'odd');
    const result = await groupBySequential(nums, parity);
    expect(result).toEqual({ odd: [1, 3, 5], even: [2, 4, 6] });
  });

  test('returns empty object for empty array', async () => {
    const result = await groupBySequential([], (n) => Promise.resolve('x'));
    expect(result).toEqual({});
  });

  test('groups strings by first letter', async () => {
    const words = ['apple', 'banana', 'avocado', 'blueberry'];
    const firstLetter = (w) => Promise.resolve(w[0]);
    const result = await groupBySequential(words, firstLetter);
    expect(result).toEqual({ a: ['apple', 'avocado'], b: ['banana', 'blueberry'] });
  });

  test('processes truly sequentially', async () => {
    const order = [];
    const items = ['a', 'b', 'c'];
    const classify = (item) => new Promise(resolve => {
      setTimeout(() => {
        order.push(item);
        resolve(item === 'b' ? 'group1' : 'group2');
      }, 20);
    });
    const result = await groupBySequential(items, classify);
    expect(order).toEqual(['a', 'b', 'c']);
    expect(result).toEqual({ group2: ['a', 'c'], group1: ['b'] });
  });

  test('handles single category', async () => {
    const nums = [2, 4, 6];
    const parity = (n) => Promise.resolve(n % 2 === 0 ? 'even' : 'odd');
    const result = await groupBySequential(nums, parity);
    expect(result).toEqual({ even: [2, 4, 6] });
  });
});
