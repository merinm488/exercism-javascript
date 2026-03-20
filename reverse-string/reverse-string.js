//
// This is only a SKELETON file for the 'Reverse String' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

//import { reverse } from "core-js/core/array";

export const reverseString = (word) => {
  let reversed = ''
  for (let i=word.length-1; i>=0;i--)
  {
    reversed+=word[i];
  }
  return reversed;

};
