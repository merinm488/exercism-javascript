//
// This is only a SKELETON file for the 'Prime Factors' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const primeFactors = (num) => {
  let factors = [];
  if (num ==1) return factors;
  else
  {
    for(let i=2;i<=num;i++)
    {
      while (num%i == 0)
      {
        factors.push(i);
        num = num/i;
      }
    }
    return factors;
  }
};
