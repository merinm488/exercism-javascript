//
// This is only a SKELETON file for the 'ISBN Verifier' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const isValid = (input) => {
  let sum = 0;
  input = input.replace(/-/g, '')
  if (/^[0-9]{9}[0-9X]$/.test(input))
  {
    let i = 10;
    for (let digit of input.split(''))
    {
      if (digit == 'X') digit = 10;
      sum += (digit * i);
      i--;
    }
    
    return sum%11 == 0;
  }
  else return false;
};
