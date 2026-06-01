import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  resolveWithValue,
  rejectWithError,
  getScore,
  safelyGet,
  getAll,
  wrapCallback,
} from './promise-basics';

describe('Task 1: resolveWithValue', () => {
  test('resolves with a number', async () => {
    const result = resolveWithValue(42);
    await expect(result).resolves.toBe(42);
  });

  test('resolves with a string', async () => {
    const result = resolveWithValue('hello');
    await expect(result).resolves.toBe('hello');
  });

  test('resolves with an object', async () => {
    const result = resolveWithValue({ name: 'Merin' });
    await expect(result).resolves.toStrictEqual({ name: 'Merin' });
  });
});

describe('Task 2: rejectWithError', () => {
  test('rejects with an Error', async () => {
    const result = rejectWithError('something broke');
    await expect(result).rejects.toThrow('something broke');
  });

  test('rejects with a different message', async () => {
    const result = rejectWithError('network failure');
    await expect(result).rejects.toThrow('network failure');
  });
});

describe('Task 3: getScore', () => {
  test('extracts the score from a student promise', async () => {
    const studentPromise = Promise.resolve({ name: 'Merin', score: 90 });
    const result = getScore(studentPromise);
    await expect(result).resolves.toBe(90);
  });

  test('extracts the score from another student', async () => {
    const studentPromise = Promise.resolve({ name: 'Alex', score: 75 });
    const result = getScore(studentPromise);
    await expect(result).resolves.toBe(75);
  });
});

describe('Task 4: safelyGet', () => {
  test('returns the value if the promise resolves', async () => {
    const goodPromise = Promise.resolve('ok');
    const result = safelyGet(goodPromise);
    await expect(result).resolves.toBe('ok');
  });

  test('returns "recovered" if the promise rejects', async () => {
    const badPromise = Promise.reject(new Error('fail'));
    const result = safelyGet(badPromise);
    await expect(result).resolves.toBe('recovered');
  });

  test('returns the value for non-string values too', async () => {
    const goodPromise = Promise.resolve(42);
    const result = safelyGet(goodPromise);
    await expect(result).resolves.toBe(42);
  });
});

describe('Task 5: getAll', () => {
  test('resolves with all values in order', async () => {
    const promises = [
      Promise.resolve(10),
      Promise.resolve(20),
      Promise.resolve(30),
    ];
    const result = getAll(promises);
    await expect(result).resolves.toStrictEqual([10, 20, 30]);
  });

  test('resolves with strings', async () => {
    const promises = [
      Promise.resolve('a'),
      Promise.resolve('b'),
      Promise.resolve('c'),
    ];
    const result = getAll(promises);
    await expect(result).resolves.toStrictEqual(['a', 'b', 'c']);
  });

  test('rejects if any one promise rejects', async () => {
    const promises = [
      Promise.resolve(10),
      Promise.reject(new Error('middle failed')),
      Promise.resolve(30),
    ];
    const result = getAll(promises);
    await expect(result).rejects.toThrow('middle failed');
  });
});

describe('Task 6: wrapCallback', () => {
  test('resolves with "success" when callback receives null', async () => {
    function successCallback(cb) {
      cb(null);
    }
    const result = wrapCallback(successCallback);
    await expect(result).resolves.toBe('success');
  });

  test('rejects when callback receives an error', async () => {
    function failCallback(cb) {
      cb(new Error('oops'));
    }
    const result = wrapCallback(failCallback);
    await expect(result).rejects.toThrow('oops');
  });

  test('resolves for a delayed callback', async () => {
    function delayedCallback(cb) {
      setTimeout(() => cb(null), 10);
    }
    const result = wrapCallback(delayedCallback);
    await expect(result).resolves.toBe('success');
  });

  test('rejects for a delayed error callback', async () => {
    function delayedErrorCallback(cb) {
      setTimeout(() => cb(new Error('delayed fail')), 10);
    }
    const result = wrapCallback(delayedErrorCallback);
    await expect(result).rejects.toThrow('delayed fail');
  });
});
