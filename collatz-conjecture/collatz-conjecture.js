//
// This is only a SKELETON file for the 'Collatz Conjecture' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const steps = (number, count=0) => {
  if(number<=0) throw new Error ('Only positive integers are allowed');
  if(number ==1) return count;
  if(number%2==0) 
  {
    number=number/2
    count++
  }
  else
  {
    number = number*3+1
    count++
  }
  
  if(number>1) return steps(number, count)
  return count;
};
