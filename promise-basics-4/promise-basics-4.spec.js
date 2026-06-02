import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  allResults,
  countSuccesses,
  withCleanup,
  firstResult,
  fetchUserOrders,
  validateTransformDelay,
} from './promise-basics-4';

// Prevent Node from crashing on unhandled rejections from rejected
// test promises when functions haven't been implemented yet.
process.on('unhandledRejection', () => {});

describe('Task 1: allResults', () => {
  test('returns settled results for mix of resolved and rejected', async () => {
    const promises = [
      Promise.resolve(10),
      Promise.reject(new Error('bad')),
      Promise.resolve(30),
    ];
    const results = await allResults(promises);

    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({ status: 'fulfilled', value: 10 });
    expect(results[1].status).toBe('rejected');
    expect(results[1].reason.message).toBe('bad');
    expect(results[2]).toEqual({ status: 'fulfilled', value: 30 });
  });

  test('returns all fulfilled when all resolve', async () => {
    const promises = [
      Promise.resolve('a'),
      Promise.resolve('b'),
    ];
    const results = await allResults(promises);

    expect(results).toEqual([
      { status: 'fulfilled', value: 'a' },
      { status: 'fulfilled', value: 'b' },
    ]);
  });

  test('returns all rejected when all reject', async () => {
    const promises = [
      Promise.reject(new Error('e1')),
      Promise.reject(new Error('e2')),
    ];
    const results = await allResults(promises);

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('rejected');
    expect(results[0].reason.message).toBe('e1');
    expect(results[1].status).toBe('rejected');
    expect(results[1].reason.message).toBe('e2');
  });

  test('handles empty array', async () => {
    const results = await allResults([]);
    expect(results).toEqual([]);
  });
});

describe('Task 2: countSuccesses', () => {
  test('counts 2 successes out of 3 promises', async () => {
    const promises = [
      Promise.resolve('ok'),
      Promise.reject(new Error('fail')),
      Promise.resolve('also ok'),
    ];
    const count = await countSuccesses(promises);
    expect(count).toBe(2);
  });

  test('counts all as successes when all resolve', async () => {
    const promises = [Promise.resolve(1), Promise.resolve(2)];
    const count = await countSuccesses(promises);
    expect(count).toBe(2);
  });

  test('counts 0 when all reject', async () => {
    const promises = [
      Promise.reject(new Error('a')),
      Promise.reject(new Error('b')),
    ];
    const count = await countSuccesses(promises);
    expect(count).toBe(0);
  });

  test('returns 0 for empty array', async () => {
    const count = await countSuccesses([]);
    expect(count).toBe(0);
  });
});

describe('Task 3: withCleanup', () => {
  test('calls cleanup and passes through resolved value', async () => {
    let cleaned = false;
    const result = withCleanup(Promise.resolve(42), () => { cleaned = true; });
    await expect(result).resolves.toBe(42);
    expect(cleaned).toBe(true);
  });

  test('calls cleanup even when promise rejects', async () => {
    let cleaned = false;
    const result = withCleanup(
      Promise.reject(new Error('fail')),
      () => { cleaned = true; }
    );
    // The promise still rejects, cleanup should still run
    await expect(result).rejects.toThrow('fail');
    expect(cleaned).toBe(true);
  });

  test('passes through string value', async () => {
    let cleaned = false;
    const result = withCleanup(
      Promise.resolve('hello'),
      () => { cleaned = true; }
    );
    await expect(result).resolves.toBe('hello');
    expect(cleaned).toBe(true);
  });
});

describe('Task 4: firstResult', () => {
  test('resolves with the faster promise', async () => {
    const promises = [
      new Promise(resolve => setTimeout(() => resolve('slow'), 200)),
      new Promise(resolve => setTimeout(() => resolve('fast'), 10)),
    ];
    const result = await firstResult(promises);
    expect(result).toBe('fast');
  });

  test('rejects if the faster promise rejects', async () => {
    const promises = [
      new Promise((_, reject) => setTimeout(() => reject(new Error('err')), 10)),
      new Promise(resolve => setTimeout(() => resolve('late'), 200)),
    ];
    await expect(firstResult(promises)).rejects.toThrow('err');
  });

  test('resolves with single promise value', async () => {
    const result = await firstResult([Promise.resolve('only one')]);
    expect(result).toBe('only one');
  });
});

describe('Task 5: fetchUserOrders', () => {
  test('fetches orders using user id', async () => {
    const userPromise = Promise.resolve({ id: 5, name: 'Merin' });
    const fetchOrders = (userId) => {
      expect(userId).toBe(5);
      return Promise.resolve([101, 102, 103]);
    };
    const result = await fetchUserOrders(userPromise, fetchOrders);
    expect(result).toEqual([101, 102, 103]);
  });

  test('fetches orders for a different user', async () => {
    const userPromise = Promise.resolve({ id: 2, name: 'Alex' });
    const fetchOrders = (userId) => {
      expect(userId).toBe(2);
      return Promise.resolve([201]);
    };
    const result = await fetchUserOrders(userPromise, fetchOrders);
    expect(result).toEqual([201]);
  });

  test('returns empty orders array', async () => {
    const userPromise = Promise.resolve({ id: 99, name: 'New' });
    const fetchOrders = () => Promise.resolve([]);
    const result = await fetchUserOrders(userPromise, fetchOrders);
    expect(result).toEqual([]);
  });

  test('propagates rejection if user promise rejects', async () => {
    const userPromise = Promise.reject(new Error('user not found'));
    const fetchOrders = () => Promise.resolve([1]);
    await expect(fetchUserOrders(userPromise, fetchOrders)).rejects.toThrow(
      'user not found'
    );
  });
});

describe('Task 6: validateTransformDelay', () => {
  test('validates, uppercases, and delays "hello"', async () => {
    const start = Date.now();
    const result = await validateTransformDelay(Promise.resolve('hello'));
    const elapsed = Date.now() - start;
    expect(result).toBe('HELLO');
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });

  test('validates, uppercases, and delays "world"', async () => {
    const result = await validateTransformDelay(Promise.resolve('world'));
    expect(result).toBe('WORLD');
  });

  test('returns "error" for string that is too short', async () => {
    const result = await validateTransformDelay(Promise.resolve('hi'));
    expect(result).toBe('error');
  });

  test('returns "error" for single character string', async () => {
    const result = await validateTransformDelay(Promise.resolve('a'));
    expect(result).toBe('error');
  });

  test('returns "error" when promise rejects', async () => {
    const result = await validateTransformDelay(
      Promise.reject(new Error('fail'))
    );
    expect(result).toBe('error');
  });
});
