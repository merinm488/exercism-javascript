//
// This is only a SKELETON file for the 'Perfect Numbers' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const classify = (number) => {
  let total = 0;
  for (let i=1; i<number; i++)
  {
    if(number%i===0) total+=i
  }
  if(number <=0) throw new Error ('Classification is only possible for natural numbers.')
  else if (number === total) return 'perfect'
  else if (number < total) return 'abundant'
  else return 'deficient'
};
