//
// This is only a SKELETON file for the 'OCR Numbers' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

const digits = {
    " _ | ||_|   ": "0",
    "     |  |   ": "1",
    " _  _||_    ": "2",
    " _  _| _|   ": "3",
    "   |_|  |   ": "4",
    " _ |_  _|   ": "5",
    " _ |_ |_|   ": "6",
    " _   |  |   ": "7",
    " _ |_||_|   ": "8",
    " _ |_| _|   ": "9",
}


export const convert = (input) => {
  input = input.split('\n'); //splits into arrays
  
  let allNumbers = []; //to push each number set
  for(let l=0; l<input.length;l+=4) // handles the multi row numbers
  {
    let totalDigits = input[l].length / 3; //check digits in each row's numbers
    let result = '';
    for(let d=0; d<totalDigits; d++) // handles each rows numbers
    {
      let str = '';
      for(let item of input.slice(l,l+4)) 
      {
        str += item.slice(d*3,d*3+3);
      }
      if (!digits[str]) result += '?';
        else result += digits[str];
    }
    allNumbers.push(result);
  }
  return allNumbers.join(',');
};
