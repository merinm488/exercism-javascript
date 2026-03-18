import { describe, expect, test, xtest } from '@jest/globals';
import { decodedValue } from './resistor-color-duo';

describe('Resistor Colors', () => {
  test('Brown and black', () => {
    expect(decodedValue(['brown', 'black'])).toEqual(10);
  });

  test('Blue and grey', () => {
    expect(decodedValue(['blue', 'grey'])).toEqual(68);
  });

  test('Yellow and violet', () => {
    expect(decodedValue(['yellow', 'violet'])).toEqual(47);
  });

  test('White and red', () => {
    expect(decodedValue(['white', 'red'])).toEqual(92);
  });

  test('Orange and orange', () => {
    expect(decodedValue(['orange', 'orange'])).toEqual(33);
  });

  test('Ignore additional colors', () => {
    expect(decodedValue(['green', 'brown', 'orange'])).toEqual(51);
  });

  test('Black and brown, one-digit', () => {
    expect(decodedValue(['black', 'brown'])).toEqual(1);
  });
});
