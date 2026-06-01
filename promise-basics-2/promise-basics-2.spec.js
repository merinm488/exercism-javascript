import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  welcome,
  validateAge,
  getCapital,
  doubleOrZero,
  getTotalPrice,
  promisify,
} from './promise-basics-2';

describe('Task 1: welcome', () => {
  test('resolves with a welcome message for Merin', async () => {
    const result = welcome('Merin');
    await expect(result).resolves.toBe('Welcome, Merin!');
  });

  test('resolves with a welcome message for Alex', async () => {
    const result = welcome('Alex');
    await expect(result).resolves.toBe('Welcome, Alex!');
  });

  test('resolves with a welcome message for an empty string', async () => {
    const result = welcome('');
    await expect(result).resolves.toBe('Welcome, !');
  });
});

describe('Task 2: validateAge', () => {
  test('resolves with "allowed" for age 25', async () => {
    const result = validateAge(25);
    await expect(result).resolves.toBe('allowed');
  });

  test('resolves with "allowed" for exactly 18', async () => {
    const result = validateAge(18);
    await expect(result).resolves.toBe('allowed');
  });

  test('rejects with "too young" for age 15', async () => {
    const result = validateAge(15);
    await expect(result).rejects.toThrow('too young');
  });

  test('rejects with "too young" for age 0', async () => {
    const result = validateAge(0);
    await expect(result).rejects.toThrow('too young');
  });
});

describe('Task 3: getCapital', () => {
  test('extracts the capital from a country promise', async () => {
    const countryPromise = Promise.resolve({
      name: 'India',
      capital: 'New Delhi',
      population: 1400000000,
    });
    const result = getCapital(countryPromise);
    await expect(result).resolves.toBe('New Delhi');
  });

  test('extracts the capital from another country', async () => {
    const countryPromise = Promise.resolve({
      name: 'Japan',
      capital: 'Tokyo',
      population: 125000000,
    });
    const result = getCapital(countryPromise);
    await expect(result).resolves.toBe('Tokyo');
  });
});

describe('Task 4: doubleOrZero', () => {
  test('doubles a resolved value of 5', async () => {
    const result = doubleOrZero(Promise.resolve(5));
    await expect(result).resolves.toBe(10);
  });

  test('doubles a resolved value of 3', async () => {
    const result = doubleOrZero(Promise.resolve(3));
    await expect(result).resolves.toBe(6);
  });

  test('returns 0 when the promise rejects', async () => {
    const result = doubleOrZero(Promise.reject(new Error('fail')));
    await expect(result).resolves.toBe(0);
  });

  test('doubles a resolved value of 0', async () => {
    const result = doubleOrZero(Promise.resolve(0));
    await expect(result).resolves.toBe(0);
  });
});

describe('Task 5: getTotalPrice', () => {
  test('sums prices from three item promises', async () => {
    const items = [
      Promise.resolve({ name: 'Book', price: 12 }),
      Promise.resolve({ name: 'Pen', price: 3 }),
      Promise.resolve({ name: 'Bag', price: 25 }),
    ];
    const result = getTotalPrice(items);
    await expect(result).resolves.toBe(40);
  });

  test('sums prices from a single item', async () => {
    const items = [Promise.resolve({ name: 'Notebook', price: 8 })];
    const result = getTotalPrice(items);
    await expect(result).resolves.toBe(8);
  });

  test('returns 0 for an empty array', async () => {
    const result = getTotalPrice([]);
    await expect(result).resolves.toBe(0);
  });

  test('rejects if any one promise rejects', async () => {
    const items = [
      Promise.resolve({ name: 'Book', price: 12 }),
      Promise.reject(new Error('item not found')),
      Promise.resolve({ name: 'Bag', price: 25 }),
    ];
    const result = getTotalPrice(items);
    await expect(result).rejects.toThrow('item not found');
  });
});

describe('Task 6: promisify', () => {
  test('resolves with data when callback receives null error', async () => {
    function getUser(cb) {
      cb(null, { name: 'Merin' });
    }
    const result = promisify(getUser);
    await expect(result).resolves.toStrictEqual({ name: 'Merin' });
  });

  test('resolves with a string data value', async () => {
    function getMessage(cb) {
      cb(null, 'hello world');
    }
    const result = promisify(getMessage);
    await expect(result).resolves.toBe('hello world');
  });

  test('rejects when callback receives an error', async () => {
    function failingFetch(cb) {
      cb(new Error('network down'), undefined);
    }
    const result = promisify(failingFetch);
    await expect(result).rejects.toThrow('network down');
  });

  test('resolves for a delayed callback', async () => {
    function delayedFetch(cb) {
      setTimeout(() => cb(null, 'delayed data'), 10);
    }
    const result = promisify(delayedFetch);
    await expect(result).resolves.toBe('delayed data');
  });

  test('rejects for a delayed error callback', async () => {
    function delayedError(cb) {
      setTimeout(() => cb(new Error('delayed fail'), undefined), 10);
    }
    const result = promisify(delayedError);
    await expect(result).rejects.toThrow('delayed fail');
  });
});
