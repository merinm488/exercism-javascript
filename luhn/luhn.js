
//
// This is only a SKELETON file for the 'Luhn' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const valid = (input) => {
  let validInput = /[^0-9 ]/.test(input); //checking if input has anything other digits and spaces, return true/false
  if(validInput) return false;

  let trimmedInput = input.split(' ').join(''); //trimming spaces
  let doubled = '';
  if(trimmedInput.length <=1) return false; //as per question

  const len = trimmedInput.length%2==0;
  let position = 1; //to track the position to double the digits
  for(let i=trimmedInput.length-1; i>=0; i-=1)
  {
    if(position%2==0)  
    {
      Number(trimmedInput[i])*2>9 ? doubled+=String(Number(trimmedInput[i])*2-9) : doubled+=String(Number(trimmedInput[i])*2)
    }
    else doubled+=trimmedInput[i];
    position++; 
  }
  
  let total = [...doubled].reduce((acc, curr) => acc + Number(curr), 0)

  return total%10==0;
};
