//
// This is only a SKELETON file for the 'Isogram' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const isIsogram = (input) => {
  let isogram = true;
  const word = input.replace(/[^a-zA-Z]/g,'').toLowerCase() ;
  let test = ''
  for (let i=0;i<word.length; i++)
  {
    if(test.includes(word[i]))
    {
      isogram = false;
      break
    }
    else test+=word[i];
  }
  return isogram;
};
