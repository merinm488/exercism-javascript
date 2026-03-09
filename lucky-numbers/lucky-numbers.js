// @ts-check

//import { reverse } from "core-js/core/array";

/**
 * Calculates the sum of the two input arrays.
 *
 * @param {number[]} array1
 * @param {number[]} array2
 * @returns {number} sum of the two arrays
 */
export function twoSum(array1, array2) {
  let sum = 0;
  let num1 = String(array1).split(',').join('');
  let num2 = String(array2).split(',').join('');
  sum = Number(num1) + Number(num2);
  return sum;
}

/**
 * Checks whether a number is a palindrome.
 *
 * @param {number} value
 * @returns {boolean} whether the number is a palindrome or not
 */
export function luckyNumber(value) {
  let reversed = "";
  if (value > 0){
    reversed = String(value).split('').reverse().join('')
  }
  return Number(reversed) === value;
}

/**
 * Determines the error message that should be shown to the user
 * for the given input value.
 *
 * @param {string|null|undefined} input
 * @returns {string} error message
 */
export function errorMessage(input) {
  if (!Boolean(input)) return "Required field";
  else if (!Boolean(Number(input))) return "Must be a number besides 0";
  else return "";
}