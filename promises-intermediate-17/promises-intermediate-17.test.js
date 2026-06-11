import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapSeries,
  oncePromise,
  retryWithFixedDelay,
  raceSuccess,
  filterAsync,
  toPromise,
} from './promises-intermediate-17.js';

// ============================================================================
// TASK 1: mapSeries
// ============================================================================
describe('mapSeries', () => {
  it('maps items sequentially', async () => {
    const items = [1, 2, 3];
    const double = (n) => Promise.resolve(n * 2);
    const result = await mapSeries(items, double);
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('returns empty array for empty input', async () => {
    const result = await mapSeries([], (x) => Promise.resolve(x));
    assert.deepEqual(result, []);
  });

  it('processes items one at a time (not in parallel)', async () => {
    const order = [];
    const items = ['a', 'b', 'c'];
    const track = (item) => new Promise((r) => {
      order.push('start ' + item);
      setTimeout(() => {
        order.push('end ' + item);
        r(item.toUpperCase());
      }, 30);
    });

    const result = await mapSeries(items, track);
    assert.deepEqual(result, ['A', 'B', 'C']);
    // Each item should finish before the next starts
    assert.deepEqual(order, [
      'start a', 'end a',
      'start b', 'end b',
      'start c', 'end c',
    ]);
  });

  it('stops and rejects when fn rejects', async () => {
    const items = [1, 2, 3];
    let callCount = 0;
    const failOnTwo = (n) => {
      callCount++;
      if (n === 2) return Promise.reject(new Error('failed on 2'));
      return Promise.resolve(n);
    };

    await assert.rejects(
      () => mapSeries(items, failOnTwo),
      { message: 'failed on 2' }
    );
    assert.equal(callCount, 2); // stopped after item 2
  });

  it('works with single item', async () => {
    const result = await mapSeries([10], (n) => Promise.resolve(n + 5));
    assert.deepEqual(result, [15]);
  });
});

// ============================================================================
// TASK 2: oncePromise
// ============================================================================
describe('oncePromise', () => {
  it('only calls fn once for multiple calls', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.resolve('result');
    };
    const once = oncePromise(fn);

    const a = await once();
    const b = await once();
    const c = await once();

    assert.equal(a, 'result');
    assert.equal(b, 'result');
    assert.equal(c, 'result');
    assert.equal(callCount, 1);
  });

  it('returns the same promise each time', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.resolve({ data: 'hello' });
    };
    const once = oncePromise(fn);

    const p1 = once();
    const p2 = once();
    assert.equal(p1, p2); // same promise object
    assert.equal(callCount, 1);
  });

  it('handles rejection — returns same rejected promise', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.reject(new Error('nope'));
    };
    const once = oncePromise(fn);

    await assert.rejects(() => once(), { message: 'nope' });
    await assert.rejects(() => once(), { message: 'nope' });
    assert.equal(callCount, 1);
  });

  it('works with fn that takes no arguments', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.resolve(42);
    };
    const once = oncePromise(fn);

    assert.equal(await once(), 42);
    assert.equal(await once(), 42);
    assert.equal(callCount, 1);
  });
});

// ============================================================================
// TASK 3: retryWithFixedDelay
// ============================================================================
describe('retryWithFixedDelay', () => {
  it('resolves immediately on first success', async () => {
    const result = await retryWithFixedDelay(
      () => Promise.resolve('ok'),
      3,
      10
    );
    assert.equal(result, 'ok');
  });

  it('retries and succeeds on later attempt', async () => {
    let attempts = 0;
    const fn = () => {
      attempts++;
      if (attempts < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('success');
    };
    const result = await retryWithFixedDelay(fn, 5, 10);
    assert.equal(result, 'success');
    assert.equal(attempts, 3);
  });

  it('rejects with last error after all retries exhausted', async () => {
    await assert.rejects(
      () => retryWithFixedDelay(
        () => Promise.reject(new Error('always fails')),
        2,
        5
      ),
      { message: 'always fails' }
    );
  });

  it('uses constant delay (not exponential)', async () => {
    let attempts = 0;
    const start = Date.now();
    const fn = () => {
      attempts++;
      if (attempts < 4) return Promise.reject(new Error('retry'));
      return Promise.resolve('done');
    };
    await retryWithFixedDelay(fn, 5, 50);
    const elapsed = Date.now() - start;
    // Fixed delays: 50 + 50 + 50 = 150ms minimum
    // If exponential: 50 + 100 + 200 = 350ms
    assert.ok(elapsed >= 140, `expected >= 140ms, got ${elapsed}ms`);
    assert.ok(elapsed < 300, `expected < 300ms (not exponential), got ${elapsed}ms`);
  });
});

// ============================================================================
// TASK 4: raceSuccess
// ============================================================================
describe('raceSuccess', () => {
  it('returns the first successful result', async () => {
    const result = await raceSuccess([
      () => Promise.reject(new Error('fail')),
      () => Promise.resolve('winner'),
    ]);
    assert.equal(result, 'winner');
  });

  it('ignores rejections and waits for a success', async () => {
    const result = await raceSuccess([
      () => Promise.reject(new Error('fail 1')),
      () => Promise.reject(new Error('fail 2')),
      () => new Promise((r) => setTimeout(() => r('late success'), 20)),
    ]);
    assert.equal(result, 'late success');
  });

  it('returns the fastest success among multiple', async () => {
    const result = await raceSuccess([
      () => new Promise((r) => setTimeout(() => r('slow'), 50)),
      () => Promise.reject(new Error('fail')),
      () => new Promise((r) => setTimeout(() => r('fast'), 10)),
    ]);
    assert.equal(result, 'fast');
  });

  it('rejects with "all failed" when everything rejects', async () => {
    await assert.rejects(
      () => raceSuccess([
        () => Promise.reject(new Error('a')),
        () => Promise.reject(new Error('b')),
        () => Promise.reject(new Error('c')),
      ]),
      { message: 'all failed' }
    );
  });

  it('rejects with error for empty array', async () => {
    await assert.rejects(
      () => raceSuccess([]),
      { message: 'no functions provided' }
    );
  });
});

// ============================================================================
// TASK 5: filterAsync
// ============================================================================
describe('filterAsync', () => {
  it('filters items based on async predicate', async () => {
    const items = [1, 2, 3, 4, 5];
    const isBig = (n) => Promise.resolve(n > 3);
    const result = await filterAsync(items, isBig);
    assert.deepEqual(result, [4, 5]);
  });

  it('returns empty array when nothing matches', async () => {
    const items = [1, 2, 3];
    const isBig = (n) => Promise.resolve(n > 10);
    const result = await filterAsync(items, isBig);
    assert.deepEqual(result, []);
  });

  it('returns all items when everything matches', async () => {
    const items = [2, 4, 6];
    const isEven = (n) => Promise.resolve(n % 2 === 0);
    const result = await filterAsync(items, isEven);
    assert.deepEqual(result, [2, 4, 6]);
  });

  it('returns empty array for empty input', async () => {
    const result = await filterAsync([], (x) => Promise.resolve(true));
    assert.deepEqual(result, []);
  });

  it('rejects when predicate rejects', async () => {
    const items = [1, 2, 3];
    const failOnTwo = (n) => {
      if (n === 2) return Promise.reject(new Error('predicate failed'));
      return Promise.resolve(true);
    };
    await assert.rejects(
      () => filterAsync(items, failOnTwo),
      { message: 'predicate failed' }
    );
  });

  it('preserves original order', async () => {
    const items = [
      { name: 'Alice', active: true },
      { name: 'Bob', active: false },
      { name: 'Carol', active: true },
      { name: 'Dave', active: false },
    ];
    const isActive = (user) => Promise.resolve(user.active);
    const result = await filterAsync(items, isActive);
    assert.deepEqual(result, [
      { name: 'Alice', active: true },
      { name: 'Carol', active: true },
    ]);
  });
});

// ============================================================================
// TASK 6: toPromise
// ============================================================================
describe('toPromise', () => {
  it('converts a success callback to a resolved promise', async () => {
    function oldFetch(url, callback) {
      if (url === '/ok') callback(null, 'data');
      else callback(new Error('not found'));
    }

    const fetchPromise = toPromise(oldFetch);
    const result = await fetchPromise('/ok');
    assert.equal(result, 'data');
  });

  it('converts a failure callback to a rejected promise', async () => {
    function oldFetch(url, callback) {
      if (url === '/ok') callback(null, 'data');
      else callback(new Error('not found'));
    }

    const fetchPromise = toPromise(oldFetch);
    await assert.rejects(
      () => fetchPromise('/bad'),
      { message: 'not found' }
    );
  });

  it('works with multiple arguments', async () => {
    function oldAdd(a, b, callback) {
      callback(null, a + b);
    }

    const addPromise = toPromise(oldAdd);
    const result = await addPromise(3, 4);
    assert.equal(result, 7);
  });

  it('works with no arguments', async () => {
    function oldGetTime(callback) {
      callback(null, 42);
    }

    const getTimePromise = toPromise(oldGetTime);
    const result = await getTimePromise();
    assert.equal(result, 42);
  });

  it('handles callback with error as first argument', async () => {
    function oldReadFile(path, callback) {
      callback(new Error('file not found: ' + path));
    }

    const readFilePromise = toPromise(oldReadFile);
    await assert.rejects(
      () => readFilePromise('/missing.txt'),
      { message: 'file not found: /missing.txt' }
    );
  });
});
