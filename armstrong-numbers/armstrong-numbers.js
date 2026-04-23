//
// This is only a SKELETON file for the 'Armstrong Numbers' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const isArmstrongNumber = (num) => {
  let number = num.toString();
  let total = 0;
  if (typeof num == 'bigint') total = 0n;
  for (let i of number)
  {
    if(typeof num == 'bigint') 
    {

      total += BigInt(i)**BigInt(number.length)
    }
    else 
    {
      total+= Number(i)**number.length
    }
  }
  return num == total;
};
