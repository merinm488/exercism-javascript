//
// This is only a SKELETON file for the 'Word Count' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const countWords = (input) => {
  let sentence = input.match(/[a-zA-Z0-9']+/g);
  let result = {};
  for (let word of sentence)
  {
    let lower = word.toLowerCase();
    lower = lower.replace(/^'+|'+$/g, '');
    if(lower)
    {
      if (!result[lower]) result[lower] = 1;
      else result[lower]++;
    }
  }
  return result;
};
