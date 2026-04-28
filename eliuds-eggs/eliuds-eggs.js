//
// This is only a SKELETON file for the 'Eliud's Eggs' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const eggCount = (displayValue) => {
  let count = 0;
  while(displayValue>0)
  {
    if (displayValue%2 == 1) 
    {
      count++
    }
    displayValue = Math.floor(displayValue/2);
  }
  return count;
};
