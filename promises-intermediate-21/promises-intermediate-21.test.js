import { describe, it } from '@jest/globals';
import assert from 'node:assert/strict';
import {
  groupByAsync,
  compactAsync,
  sortByAsync,
  scanAsync,
  flatMapSequential,
  uniqByAsync,
} from './promises-intermediate-21.js';

// ============================================================================
// TASK 1: groupByAsync
// ============================================================================
describe('groupByAsync', () => {
  it('groups numbers by even/odd', async () => {
    const result = await groupByAsync(
      [1, 2, 3, 4, 5, 6],
      (n) => Promise.resolve(n % 2 === 0 ? 'even' : 'odd')
    );
    assert.deepEqual(result, { odd: [1, 3, 5], even: [2, 4, 6] });
  });

  it('groups strings by first letter', async () => {
    const result = await groupByAsync(
      ['apple', 'apricot', 'banana', 'blueberry', 'cherry'],
      (s) => Promise.resolve(s[0])
    );
    assert.deepEqual(result, {
      a: ['apple', 'apricot'],
      b: ['banana', 'blueberry'],
      c: ['cherry'],
    });
  });

  it('returns empty object for empty input', async () => {
    const result = await groupByAsync([], (x) => Promise.resolve('cat'));
    assert.deepEqual(result, {});
  });

  it('handles single category', async () => {
    const result = await groupByAsync(
      [1, 2, 3],
      () => Promise.resolve('same')
    );
    assert.deepEqual(result, { same: [1, 2, 3] });
  });

  it('handles many categories', async () => {
    const result = await groupByAsync(
      [1, 2, 3],
      (n) => Promise.resolve('cat' + n)
    );
    assert.deepEqual(result, { cat1: [1], cat2: [2], cat3: [3] });
  });

  it('groups objects by property', async () => {
    const users = [
      { name: 'Alice', dept: 'engineering' },
      { name: 'Bob', dept: 'marketing' },
      { name: 'Carol', dept: 'engineering' },
    ];
    const result = await groupByAsync(
      users,
      (u) => Promise.resolve(u.dept)
    );
    assert.deepEqual(result, {
      engineering: [users[0], users[2]],
      marketing: [users[1]],
    });
  });
});

// ============================================================================
// TASK 2: compactAsync
// ============================================================================
describe('compactAsync', () => {
  it('removes null results', async () => {
    const result = await compactAsync(
      [1, 2, 3, 4],
      (n) => Promise.resolve(n % 2 === 0 ? n * 10 : null)
    );
    assert.deepEqual(result, [20, 40]);
  });

  it('removes undefined results', async () => {
    const result = await compactAsync(
      ['hello', '', 'world'],
      (s) => Promise.resolve(s || undefined)
    );
    assert.deepEqual(result, ['hello', 'world']);
  });

  it('returns empty array for empty input', async () => {
    const result = await compactAsync([], (x) => Promise.resolve(x));
    assert.deepEqual(result, []);
  });

  it('keeps all values when none are null', async () => {
    const result = await compactAsync(
      [1, 2, 3],
      (n) => Promise.resolve(n * 2)
    );
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('returns empty when all results are null', async () => {
    const result = await compactAsync(
      [1, 2, 3],
      () => Promise.resolve(null)
    );
    assert.deepEqual(result, []);
  });

  it('keeps falsy values that are not null or undefined', async () => {
    const result = await compactAsync(
      [0, false, '', null, undefined, 42],
      (x) => Promise.resolve(x)
    );
    assert.deepEqual(result, [0, false, '', 42]);
  });
});

// ============================================================================
// TASK 3: sortByAsync
// ============================================================================
describe('sortByAsync', () => {
  it('sorts strings by length', async () => {
    const result = await sortByAsync(
      ['banana', 'apple', 'cherry'],
      (s) => Promise.resolve(s.length)
    );
    assert.deepEqual(result, ['apple', 'banana', 'cherry']);
  });

  it('sorts numbers by negated value (descending)', async () => {
    const result = await sortByAsync(
      [3, 1, 2],
      (n) => Promise.resolve(-n)
    );
    assert.deepEqual(result, [3, 2, 1]);
  });

  it('returns empty for empty input', async () => {
    const result = await sortByAsync([], (x) => Promise.resolve(x));
    assert.deepEqual(result, []);
  });

  it('handles single element', async () => {
    const result = await sortByAsync([42], (n) => Promise.resolve(n));
    assert.deepEqual(result, [42]);
  });

  it('sorts objects by async key', async () => {
    const items = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 28 },
    ];
    const result = await sortByAsync(
      items,
      (item) => Promise.resolve(item.age)
    );
    assert.deepEqual(result, [items[1], items[2], items[0]]);
  });

  it('stable sort for equal keys', async () => {
    const result = await sortByAsync(
      ['bb', 'aa', 'cc'],
      (s) => Promise.resolve(s.length)
    );
    assert.deepEqual(result, ['bb', 'aa', 'cc']);
  });
});

// ============================================================================
// TASK 4: scanAsync
// ============================================================================
describe('scanAsync', () => {
  it('returns running sums', async () => {
    const result = await scanAsync(
      [1, 2, 3],
      (acc, n) => Promise.resolve(acc + n),
      0
    );
    assert.deepEqual(result, [0, 1, 3, 6]);
  });

  it('returns running string concatenation', async () => {
    const result = await scanAsync(
      ['a', 'b', 'c'],
      (acc, s) => Promise.resolve(acc + s),
      ''
    );
    assert.deepEqual(result, ['', 'a', 'ab', 'abc']);
  });

  it('returns just initial value for empty input', async () => {
    const result = await scanAsync(
      [],
      (acc, x) => Promise.resolve(acc + x),
      42
    );
    assert.deepEqual(result, [42]);
  });

  it('works with single item', async () => {
    const result = await scanAsync(
      [5],
      (acc, n) => Promise.resolve(acc * n),
      1
    );
    assert.deepEqual(result, [1, 5]);
  });

  it('tracks running max', async () => {
    const result = await scanAsync(
      [3, 7, 2, 9, 4],
      (acc, n) => Promise.resolve(Math.max(acc, n)),
      0
    );
    assert.deepEqual(result, [0, 3, 7, 7, 9, 9]);
  });

  it('works with array accumulation', async () => {
    const result = await scanAsync(
      [1, 2, 3],
      (acc, n) => Promise.resolve([...acc, n]),
      []
    );
    assert.deepEqual(result, [[], [1], [1, 2], [1, 2, 3]]);
  });
});

// ============================================================================
// TASK 5: flatMapSequential
// ============================================================================
describe('flatMapSequential', () => {
  it('maps and flattens sequentially', async () => {
    const result = await flatMapSequential(
      [1, 2, 3],
      (n) => Promise.resolve([n, n * 10])
    );
    assert.deepEqual(result, [1, 10, 2, 20, 3, 30]);
  });

  it('returns empty array for empty input', async () => {
    const result = await flatMapSequential([], (x) => Promise.resolve([x]));
    assert.deepEqual(result, []);
  });

  it('handles functions returning single-element arrays', async () => {
    const result = await flatMapSequential(
      [1, 2, 3],
      (n) => Promise.resolve([n * 2])
    );
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('handles functions returning empty arrays', async () => {
    const result = await flatMapSequential(
      [1, 2, 3],
      (n) => Promise.resolve(n === 2 ? [] : [n])
    );
    assert.deepEqual(result, [1, 3]);
  });

  it('processes items in order', async () => {
    const order = [];
    const result = await flatMapSequential(
      ['a', 'b', 'c'],
      (s) => new Promise((resolve) => {
        order.push(s);
        resolve([s.toUpperCase()]);
      })
    );
    assert.deepEqual(order, ['a', 'b', 'c']);
    assert.deepEqual(result, ['A', 'B', 'C']);
  });

  it('splits words sequentially', async () => {
    const result = await flatMapSequential(
      ['hello world', 'good morning'],
      (s) => Promise.resolve(s.split(' '))
    );
    assert.deepEqual(result, ['hello', 'world', 'good', 'morning']);
  });
});

// ============================================================================
// TASK 6: uniqByAsync
// ============================================================================
describe('uniqByAsync', () => {
  it('removes duplicate numbers', async () => {
    const result = await uniqByAsync(
      [1, 2, 3, 2, 1, 4],
      (n) => Promise.resolve(n)
    );
    assert.deepEqual(result, [1, 2, 3, 4]);
  });

  it('removes duplicates by first letter (case insensitive)', async () => {
    const result = await uniqByAsync(
      ['Apple', 'apricot', 'Avocado', 'banana'],
      (s) => Promise.resolve(s[0].toLowerCase())
    );
    assert.deepEqual(result, ['Apple', 'banana']);
  });

  it('returns empty for empty input', async () => {
    const result = await uniqByAsync([], (x) => Promise.resolve(x));
    assert.deepEqual(result, []);
  });

  it('keeps all unique items', async () => {
    const result = await uniqByAsync(
      [1, 2, 3],
      (n) => Promise.resolve(n)
    );
    assert.deepEqual(result, [1, 2, 3]);
  });

  it('keeps first occurrence of each duplicate', async () => {
    const result = await uniqByAsync(
      ['a', 'b', 'a', 'c', 'b'],
      (s) => Promise.resolve(s)
    );
    assert.deepEqual(result, ['a', 'b', 'c']);
  });

  it('deduplicates objects by property', async () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice duplicate' },
      { id: 3, name: 'Carol' },
    ];
    const result = await uniqByAsync(
      items,
      (item) => Promise.resolve(item.id)
    );
    assert.deepEqual(result, [items[0], items[1], items[3]]);
  });
});
