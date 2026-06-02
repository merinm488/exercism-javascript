import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  doubleAndFormat,
  getTopStudents,
  extractEmail,
  greetIfAdult,
  countItems,
  delayResolve,
} from './promise-basics-3';

describe('Task 1: doubleAndFormat', () => {
  test('doubles 5 and formats as "Result: 10"', async () => {
    const result = doubleAndFormat(Promise.resolve(5));
    await expect(result).resolves.toBe('Result: 10');
  });

  test('doubles 0 and formats as "Result: 0"', async () => {
    const result = doubleAndFormat(Promise.resolve(0));
    await expect(result).resolves.toBe('Result: 0');
  });

  test('doubles -3 and formats as "Result: -6"', async () => {
    const result = doubleAndFormat(Promise.resolve(-3));
    await expect(result).resolves.toBe('Result: -6');
  });

  test('doubles 100 and formats as "Result: 200"', async () => {
    const result = doubleAndFormat(Promise.resolve(100));
    await expect(result).resolves.toBe('Result: 200');
  });
});

describe('Task 2: getTopStudents', () => {
  test('filters students with grade >= 70', async () => {
    const students = [
      Promise.resolve({ name: 'Merin', grade: 85 }),
      Promise.resolve({ name: 'Alex', grade: 60 }),
      Promise.resolve({ name: 'Sam', grade: 72 }),
    ];
    const result = getTopStudents(students);
    await expect(result).resolves.toStrictEqual(['Merin', 'Sam']);
  });

  test('returns all names when all have grade >= 70', async () => {
    const students = [
      Promise.resolve({ name: 'A', grade: 70 }),
      Promise.resolve({ name: 'B', grade: 80 }),
    ];
    const result = getTopStudents(students);
    await expect(result).resolves.toStrictEqual(['A', 'B']);
  });

  test('returns empty array when no one has grade >= 70', async () => {
    const students = [
      Promise.resolve({ name: 'A', grade: 50 }),
      Promise.resolve({ name: 'B', grade: 60 }),
    ];
    const result = getTopStudents(students);
    await expect(result).resolves.toStrictEqual([]);
  });

  test('returns empty array for empty input', async () => {
    const result = getTopStudents([]);
    await expect(result).resolves.toStrictEqual([]);
  });
});

describe('Task 3: extractEmail', () => {
  test('extracts email from nested object', async () => {
    const userPromise = Promise.resolve({
      profile: { email: 'merin@example.com' },
    });
    const result = extractEmail(userPromise);
    await expect(result).resolves.toBe('merin@example.com');
  });

  test('extracts a different email', async () => {
    const userPromise = Promise.resolve({
      profile: { email: 'test@test.com' },
    });
    const result = extractEmail(userPromise);
    await expect(result).resolves.toBe('test@test.com');
  });

  test('returns "no email" when promise rejects', async () => {
    const result = extractEmail(Promise.reject(new Error('fail')));
    await expect(result).resolves.toBe('no email');
  });
});

describe('Task 4: greetIfAdult', () => {
  test('greets an adult (age 25)', async () => {
    const result = greetIfAdult(
      Promise.resolve({ name: 'Merin', age: 25 })
    );
    await expect(result).resolves.toBe('Hello, Merin!');
  });

  test('greets someone who is exactly 18', async () => {
    const result = greetIfAdult(
      Promise.resolve({ name: 'Sam', age: 18 })
    );
    await expect(result).resolves.toBe('Hello, Sam!');
  });

  test('denies access for age 12', async () => {
    const result = greetIfAdult(
      Promise.resolve({ name: 'Kid', age: 12 })
    );
    await expect(result).resolves.toBe('access denied');
  });

  test('denies access for age 0', async () => {
    const result = greetIfAdult(
      Promise.resolve({ name: 'Baby', age: 0 })
    );
    await expect(result).resolves.toBe('access denied');
  });

  test('denies access when promise rejects', async () => {
    const result = greetIfAdult(Promise.reject(new Error('fail')));
    await expect(result).resolves.toBe('access denied');
  });
});

describe('Task 5: countItems', () => {
  test('counts total quantity of three items', async () => {
    const items = [
      Promise.resolve({ product: 'Book', quantity: 3 }),
      Promise.resolve({ product: 'Pen', quantity: 1 }),
      Promise.resolve({ product: 'Bag', quantity: 2 }),
    ];
    const result = countItems(items);
    await expect(result).resolves.toBe(6);
  });

  test('counts a single item', async () => {
    const items = [Promise.resolve({ product: 'Notebook', quantity: 5 })];
    const result = countItems(items);
    await expect(result).resolves.toBe(5);
  });

  test('returns 0 for empty array', async () => {
    const result = countItems([]);
    await expect(result).resolves.toBe(0);
  });

  test('rejects if any one promise rejects', async () => {
    const items = [
      Promise.resolve({ product: 'Book', quantity: 3 }),
      Promise.reject(new Error('item not found')),
      Promise.resolve({ product: 'Bag', quantity: 2 }),
    ];
    const result = countItems(items);
    await expect(result).rejects.toThrow('item not found');
  });
});

describe('Task 6: delayResolve', () => {
  test('resolves with the value after delay', async () => {
    const result = delayResolve('hello', 10);
    await expect(result).resolves.toBe('hello');
  });

  test('resolves with a number after delay', async () => {
    const result = delayResolve(42, 10);
    await expect(result).resolves.toBe(42);
  });

  test('resolves with an object after delay', async () => {
    const result = delayResolve({ name: 'Merin' }, 10);
    await expect(result).resolves.toStrictEqual({ name: 'Merin' });
  });

  test('actually waits before resolving', async () => {
    const start = Date.now();
    await delayResolve('done', 50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});
