import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  debounceAsync,
  throttleAsync,
  flatMapAsync,
  zipAsync,
  takeWhileAsync,
  countByAsync,
} from './promises-intermediate-20.js';

// ============================================================================
// TASK 1: debounceAsync
// ============================================================================
describe('debounceAsync', () => {
  it('only calls fn once after calls stop', async () => {
    let callCount = 0;
    const fn = (val) => {
      callCount++;
      return Promise.resolve(val * 2);
    };
    const debounced = debounceAsync(fn, 50);

    debounced(1);
    debounced(2);
    const result = await debounced(3);

    assert.equal(callCount, 1);
    assert.equal(result, 6); // fn was called with 3
  });

  it('calls fn again after the delay passes', async () => {
    let callCount = 0;
    const fn = (val) => {
      callCount++;
      return Promise.resolve(val);
    };
    const debounced = debounceAsync(fn, 30);

    const r1 = await debounced('first');
    assert.equal(callCount, 1);
    assert.equal(r1, 'first');

    // Wait for debounce period to pass
    await new Promise(r => setTimeout(r, 50));

    const r2 = await debounced('second');
    assert.equal(callCount, 2);
    assert.equal(r2, 'second');
  });

  it('works with no arguments', async () => {
    let called = false;
    const fn = () => {
      called = true;
      return Promise.resolve(42);
    };
    const debounced = debounceAsync(fn, 10);

    const result = await debounced();
    assert.equal(called, true);
    assert.equal(result, 42);
  });

  it('passes rejection through', async () => {
    const fn = () => Promise.reject(new Error('debounced error'));
    const debounced = debounceAsync(fn, 10);

    await assert.rejects(
      () => debounced(),
      { message: 'debounced error' }
    );
  });
});

// ============================================================================
// TASK 2: throttleAsync
// ============================================================================
describe('throttleAsync', () => {
  it('executes on first call', async () => {
    let callCount = 0;
    const fn = (val) => {
      callCount++;
      return Promise.resolve(val * 10);
    };
    const throttled = throttleAsync(fn, 100);

    const result = await throttled(5);
    assert.equal(callCount, 1);
    assert.equal(result, 50);
  });

  it('reuses result for calls within the interval', async () => {
    let callCount = 0;
    const fn = (val) => {
      callCount++;
      return Promise.resolve(val);
    };
    const throttled = throttleAsync(fn, 100);

    const p1 = throttled(1);
    const p2 = throttled(2);
    const p3 = throttled(3);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
    assert.equal(callCount, 1);
    assert.equal(r1, 1);
    assert.equal(r2, 1); // same as first call
    assert.equal(r3, 1); // same as first call
  });

  it('allows new call after interval passes', async () => {
    let callCount = 0;
    const fn = (val) => {
      callCount++;
      return Promise.resolve(val);
    };
    const throttled = throttleAsync(fn, 50);

    await throttled('first');
    assert.equal(callCount, 1);

    // Wait for throttle interval to pass
    await new Promise(r => setTimeout(r, 60));

    const result = await throttled('second');
    assert.equal(callCount, 2);
    assert.equal(result, 'second');
  });

  it('works with no arguments', async () => {
    const fn = () => Promise.resolve('default');
    const throttled = throttleAsync(fn, 50);

    const result = await throttled();
    assert.equal(result, 'default');
  });
});

// ============================================================================
// TASK 3: flatMapAsync
// ============================================================================
describe('flatMapAsync', () => {
  it('maps and flattens results', async () => {
    const words = ['hello world', 'good morning'];
    const splitWords = (s) => Promise.resolve(s.split(' '));
    const result = await flatMapAsync(words, splitWords);
    assert.deepEqual(result, ['hello', 'world', 'good', 'morning']);
  });

  it('returns empty array for empty input', async () => {
    const result = await flatMapAsync([], (x) => Promise.resolve([x]));
    assert.deepEqual(result, []);
  });

  it('handles functions returning single-element arrays', async () => {
    const nums = [1, 2, 3];
    const wrap = (n) => Promise.resolve([n * 2]);
    const result = await flatMapAsync(nums, wrap);
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('handles functions returning multiple elements', async () => {
    const nums = [1, 2, 3];
    const duplicates = (n) => Promise.resolve([n, n * 10]);
    const result = await flatMapAsync(nums, duplicates);
    assert.deepEqual(result, [1, 10, 2, 20, 3, 30]);
  });

  it('handles functions returning empty arrays', async () => {
    const nums = [1, 2, 3];
    const empty = (n) => Promise.resolve(n === 2 ? [] : [n]);
    const result = await flatMapAsync(nums, empty);
    assert.deepEqual(result, [1, 3]);
  });
});

// ============================================================================
// TASK 4: zipAsync
// ============================================================================
describe('zipAsync', () => {
  it('combines two arrays element-wise', async () => {
    const result = await zipAsync(
      [1, 2, 3],
      [10, 20, 30],
      (a, b) => Promise.resolve(a + b)
    );
    assert.deepEqual(result, [11, 22, 33]);
  });

  it('combines strings', async () => {
    const result = await zipAsync(
      ['a', 'b'],
      ['x', 'y'],
      (a, b) => Promise.resolve(a + b)
    );
    assert.deepEqual(result, ['ax', 'by']);
  });

  it('stops at the shorter array', async () => {
    const result = await zipAsync(
      [1, 2, 3],
      [10, 20],
      (a, b) => Promise.resolve(a + b)
    );
    assert.deepEqual(result, [11, 22]);
  });

  it('returns empty for two empty arrays', async () => {
    const result = await zipAsync([], [], (a, b) => Promise.resolve(a + b));
    assert.deepEqual(result, []);
  });

  it('returns empty when one array is empty', async () => {
    const result = await zipAsync([1, 2], [], (a, b) => Promise.resolve(a + b));
    assert.deepEqual(result, []);
  });

  it('works with object results', async () => {
    const result = await zipAsync(
      ['name', 'age'],
      ['Alice', 30],
      (key, val) => Promise.resolve({ [key]: val })
    );
    assert.deepEqual(result, [{ name: 'Alice' }, { age: 30 }]);
  });
});

// ============================================================================
// TASK 5: takeWhileAsync
// ============================================================================
describe('takeWhileAsync', () => {
  it('takes items while predicate is true', async () => {
    const result = await takeWhileAsync(
      [1, 2, 3, 4, 5],
      (n) => Promise.resolve(n < 4)
    );
    assert.deepEqual(result, [1, 2, 3]);
  });

  it('returns empty if first item fails', async () => {
    const result = await takeWhileAsync(
      [5, 1, 2],
      (n) => Promise.resolve(n < 4)
    );
    assert.deepEqual(result, []);
  });

  it('returns all items if all pass', async () => {
    const result = await takeWhileAsync(
      [1, 2, 3],
      (n) => Promise.resolve(true)
    );
    assert.deepEqual(result, [1, 2, 3]);
  });

  it('returns empty for empty input', async () => {
    const result = await takeWhileAsync([], (n) => Promise.resolve(true));
    assert.deepEqual(result, []);
  });

  it('stops at first false and does not test remaining', async () => {
    const tested = [];
    const items = [1, 2, 3, 4, 5, 6];
    const track = (n) => new Promise((r) => {
      tested.push(n);
      r(n < 3);
    });

    const result = await takeWhileAsync(items, track);
    assert.deepEqual(result, [1, 2]);
    assert.deepEqual(tested, [1, 2, 3]); // stopped after 3 failed
  });

  it('works with strings', async () => {
    const result = await takeWhileAsync(
      ['a', 'bb', 'ccc', 'dddd'],
      (s) => Promise.resolve(s.length <= 3)
    );
    assert.deepEqual(result, ['a', 'bb', 'ccc']);
  });
});

// ============================================================================
// TASK 6: countByAsync
// ============================================================================
describe('countByAsync', () => {
  it('counts even and odd numbers', async () => {
    const result = await countByAsync(
      [1, 2, 3, 4, 5, 6],
      (n) => Promise.resolve(n % 2 === 0 ? 'even' : 'odd')
    );
    assert.deepEqual(result, { odd: 3, even: 3 });
  });

  it('counts string lengths', async () => {
    const result = await countByAsync(
      ['a', 'bb', 'ccc', 'dd'],
      (s) => Promise.resolve(s.length > 2 ? 'long' : 'short')
    );
    assert.deepEqual(result, { short: 3, long: 1 });
  });

  it('returns empty object for empty input', async () => {
    const result = await countByAsync([], (x) => Promise.resolve('cat'));
    assert.deepEqual(result, {});
  });

  it('handles single category', async () => {
    const result = await countByAsync(
      [1, 2, 3],
      () => Promise.resolve('same')
    );
    assert.deepEqual(result, { same: 3 });
  });

  it('handles many categories', async () => {
    const result = await countByAsync(
      [1, 2, 3, 4, 5],
      (n) => Promise.resolve('cat' + n)
    );
    assert.deepEqual(result, { cat1: 1, cat2: 1, cat3: 1, cat4: 1, cat5: 1 });
  });

  it('counts active and inactive users', async () => {
    const users = [
      { name: 'Alice', active: true },
      { name: 'Bob', active: false },
      { name: 'Carol', active: true },
      { name: 'Dave', active: false },
    ];
    const result = await countByAsync(
      users,
      (u) => Promise.resolve(u.active ? 'active' : 'inactive')
    );
    assert.deepEqual(result, { active: 2, inactive: 2 });
  });
});
