import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  allSettledReport,
  firstSuccessful,
  withFallback,
  retryWithBackoff,
  runAllWithRecovery,
  concurrentLimit,
} from './promises-intermediate-14';

process.on('unhandledRejection', () => {});

describe('Task 1: allSettledReport', () => {
  test('reports fulfilled and rejected results', async () => {
    const tasks = [
      () => Promise.resolve('ok'),
      () => Promise.reject(new Error('fail')),
      () => Promise.resolve(42),
    ];
    const report = await allSettledReport(tasks);
    expect(report.fulfilled).toEqual(['ok', 42]);
    expect(report.rejected).toEqual(['fail']);
  });

  test('all fulfilled', async () => {
    const tasks = [
      () => Promise.resolve('a'),
      () => Promise.resolve('b'),
    ];
    const report = await allSettledReport(tasks);
    expect(report.fulfilled).toEqual(['a', 'b']);
    expect(report.rejected).toEqual([]);
  });

  test('all rejected', async () => {
    const tasks = [
      () => Promise.reject(new Error('x')),
      () => Promise.reject(new Error('y')),
    ];
    const report = await allSettledReport(tasks);
    expect(report.fulfilled).toEqual([]);
    expect(report.rejected).toEqual(['x', 'y']);
  });

  test('empty array', async () => {
    const report = await allSettledReport([]);
    expect(report.fulfilled).toEqual([]);
    expect(report.rejected).toEqual([]);
  });

  test('runs in parallel', async () => {
    const order = [];
    const tasks = [
      () => new Promise((r) => setTimeout(() => { order.push('a'); r(1); }, 30)),
      () => new Promise((r) => setTimeout(() => { order.push('b'); r(2); }, 10)),
    ];
    const report = await allSettledReport(tasks);
    // Parallel: b finishes before a
    expect(order).toEqual(['b', 'a']);
    expect(report.fulfilled).toEqual([1, 2]);
  });
});

describe('Task 2: firstSuccessful', () => {
  test('returns first resolved value', async () => {
    const tasks = [
      () => Promise.reject(new Error('no')),
      () => Promise.resolve('yes'),
      () => Promise.resolve('also'),
    ];
    expect(await firstSuccessful(tasks)).toBe('yes');
  });

  test('returns immediately if first resolves', async () => {
    const tasks = [
      () => Promise.resolve('first'),
      () => Promise.reject(new Error('ignored')),
    ];
    expect(await firstSuccessful(tasks)).toBe('first');
  });

  test('rejects with AggregateError when all fail', async () => {
    const tasks = [
      () => Promise.reject(new Error('a')),
      () => Promise.reject(new Error('b')),
    ];
    try {
      await firstSuccessful(tasks);
      throw new Error('Should have rejected');
    } catch (e) {
      expect(e).toBeInstanceOf(AggregateError);
      expect(e.errors.length).toBe(2);
      expect(e.errors[0].message).toBe('a');
      expect(e.errors[1].message).toBe('b');
    }
  });

  test('single task that resolves', async () => {
    const tasks = [() => Promise.resolve('only')];
    expect(await firstSuccessful(tasks)).toBe('only');
  });

  test('picks faster resolver even if listed later', async () => {
    const tasks = [
      () => new Promise((r) => setTimeout(() => r('slow'), 100)),
      () => new Promise((r) => setTimeout(() => r('fast'), 10)),
    ];
    expect(await firstSuccessful(tasks)).toBe('fast');
  });
});

describe('Task 3: withFallback', () => {
  test('returns primary result when it succeeds', async () => {
    const primary = () => Promise.resolve('primary');
    const fallback = () => Promise.resolve('fallback');
    expect(await withFallback(primary, fallback)).toBe('primary');
  });

  test('uses fallback when primary rejects', async () => {
    const primary = () => Promise.reject(new Error('down'));
    const fallback = () => Promise.resolve('backup');
    expect(await withFallback(primary, fallback)).toBe('backup');
  });

  test('both fail — rejects with fallback error', async () => {
    const primary = () => Promise.reject(new Error('primary error'));
    const fallback = () => Promise.reject(new Error('fallback error'));
    await expect(withFallback(primary, fallback)).rejects.toThrow('fallback error');
  });

  test('works with numeric values', async () => {
    const primary = () => Promise.resolve(42);
    const fallback = () => Promise.resolve(0);
    expect(await withFallback(primary, fallback)).toBe(42);
  });
});

describe('Task 4: retryWithBackoff', () => {
  test('succeeds on first try', async () => {
    const result = await retryWithBackoff(
      () => Promise.resolve('done'),
      3,
      50
    );
    expect(result).toBe('done');
  });

  test('retries with increasing delay and eventually succeeds', async () => {
    let tries = 0;
    const flaky = () => {
      tries++;
      if (tries < 3) return Promise.reject(new Error('not yet'));
      return Promise.resolve('got it');
    };

    const start = Date.now();
    const result = await retryWithBackoff(flaky, 5, 50);
    const elapsed = Date.now() - start;

    expect(result).toBe('got it');
    // delay1: 50ms (50 * 2^0), delay2: 100ms (50 * 2^1) = ~150ms total
    expect(elapsed).toBeGreaterThanOrEqual(120);
  });

  test('rejects when all attempts fail', async () => {
    await expect(
      retryWithBackoff(() => Promise.reject(new Error('never')), 3, 10)
    ).rejects.toThrow('never');
  });

  test('respects max attempts', async () => {
    let tries = 0;
    const fn = () => {
      tries++;
      return Promise.reject(new Error('fail'));
    };

    await expect(retryWithBackoff(fn, 4, 10)).rejects.toThrow('fail');
    expect(tries).toBe(4);
  });

  test('backoff doubles each time', async () => {
    let tries = 0;
    const fn = () => {
      tries++;
      return Promise.reject(new Error('nope'));
    };

    const start = Date.now();
    await expect(retryWithBackoff(fn, 4, 50)).rejects.toThrow('nope');
    const elapsed = Date.now() - start;

    // Delays: 50 + 100 + 200 = 350ms
    expect(elapsed).toBeGreaterThanOrEqual(300);
  });

  test('single attempt — no retry', async () => {
    let tries = 0;
    const fn = () => {
      tries++;
      return Promise.resolve('ok');
    };
    const result = await retryWithBackoff(fn, 1, 50);
    expect(result).toBe('ok');
    expect(tries).toBe(1);
  });
});

describe('Task 5: runAllWithRecovery', () => {
  test('collects all results when all succeed', async () => {
    const tasks = [
      () => Promise.resolve('a'),
      () => Promise.resolve('b'),
      () => Promise.resolve('c'),
    ];
    const { results, errors } = await runAllWithRecovery(tasks);
    expect(results).toEqual(['a', 'b', 'c']);
    expect(errors).toEqual([]);
  });

  test('collects errors alongside results', async () => {
    const tasks = [
      () => Promise.resolve('ok'),
      () => Promise.reject(new Error('boom')),
      () => Promise.resolve('also ok'),
    ];
    const { results, errors } = await runAllWithRecovery(tasks);
    expect(results).toEqual(['ok', 'also ok']);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('boom');
  });

  test('multiple failures', async () => {
    const tasks = [
      () => Promise.reject(new Error('x')),
      () => Promise.resolve('y'),
      () => Promise.reject(new Error('z')),
    ];
    const { results, errors } = await runAllWithRecovery(tasks);
    expect(results).toEqual(['y']);
    expect(errors.length).toBe(2);
    expect(errors.map(e => e.message)).toEqual(['x', 'z']);
  });

  test('empty array', async () => {
    const { results, errors } = await runAllWithRecovery([]);
    expect(results).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('all fail', async () => {
    const tasks = [
      () => Promise.reject(new Error('a')),
      () => Promise.reject(new Error('b')),
    ];
    const { results, errors } = await runAllWithRecovery(tasks);
    expect(results).toEqual([]);
    expect(errors.map(e => e.message)).toEqual(['a', 'b']);
  });

  test('runs sequentially', async () => {
    const order = [];
    const tasks = [
      () => new Promise((r) => setTimeout(() => { order.push('a'); r('A'); }, 30)),
      () => new Promise((r) => setTimeout(() => { order.push('b'); r('B'); }, 10)),
    ];
    await runAllWithRecovery(tasks);
    expect(order).toEqual(['a', 'b']);
  });
});

describe('Task 6: concurrentLimit', () => {
  test('returns all results in order', async () => {
    const tasks = [
      () => Promise.resolve('a'),
      () => Promise.resolve('b'),
      () => Promise.resolve('c'),
      () => Promise.resolve('d'),
      () => Promise.resolve('e'),
    ];
    const result = await concurrentLimit(tasks, 2);
    expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  test('empty array', async () => {
    const result = await concurrentLimit([], 3);
    expect(result).toEqual([]);
  });

  test('single task', async () => {
    const result = await concurrentLimit([() => Promise.resolve(42)], 2);
    expect(result).toEqual([42]);
  });

  test('respects concurrency limit', async () => {
    let running = 0;
    let maxRunning = 0;
    const tasks = Array.from({ length: 6 }, (_, i) =>
      () => new Promise((r) => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        setTimeout(() => {
          running--;
          r(i);
        }, 30);
      })
    );

    const result = await concurrentLimit(tasks, 2);
    expect(result).toEqual([0, 1, 2, 3, 4, 5]);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  test('concurrency 1 is sequential', async () => {
    const order = [];
    const tasks = [
      () => new Promise((r) => setTimeout(() => { order.push('a'); r('A'); }, 30)),
      () => new Promise((r) => setTimeout(() => { order.push('b'); r('B'); }, 10)),
      () => new Promise((r) => setTimeout(() => { order.push('c'); r('C'); }, 10)),
    ];
    const result = await concurrentLimit(tasks, 1);
    expect(result).toEqual(['A', 'B', 'C']);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  test('high concurrency runs all in parallel', async () => {
    const order = [];
    const tasks = [
      () => new Promise((r) => setTimeout(() => { order.push('a'); r('A'); }, 30)),
      () => new Promise((r) => setTimeout(() => { order.push('b'); r('B'); }, 10)),
      () => new Promise((r) => setTimeout(() => { order.push('c'); r('C'); }, 10)),
    ];
    const result = await concurrentLimit(tasks, 10);
    expect(result).toEqual(['A', 'B', 'C']);
    // Parallel: b and c finish before a
    expect(order).toEqual(['b', 'c', 'a']);
  });

  test('handles rejection', async () => {
    const tasks = [
      () => Promise.resolve('a'),
      () => Promise.reject(new Error('boom')),
      () => Promise.resolve('c'),
    ];
    await expect(concurrentLimit(tasks, 2)).rejects.toThrow('boom');
  });
});
