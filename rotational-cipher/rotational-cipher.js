//
// This is only a SKELETON file for the 'Rotational Cipher' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const rotate = (input, key) => {
  let char = '';
  let code = 0;
  let modulo = 0;
  let alphabetCase = 0;
  for (let i=0; i<input.length; i++)
  {
    let charCode = input[i].charCodeAt(0);
    if (charCode >= 97 && charCode <= 122 )
    {
      code = (charCode - 97)
      modulo = (code+key)%26 + 97;
      char+=String.fromCharCode(modulo)
    }
    else if (charCode >= 65 && charCode <= 90)
    {
      code = (charCode - 65)
      modulo = (code+key)%26 + 65;
      char+=String.fromCharCode(modulo)
    }
    else{
      char+=input[i];
    }
  }
  return char;
};
