//
// This is only a SKELETON file for the 'Pangram' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const isPangram = (sentence) => {
  sentence = sentence.toLowerCase();
  let arr = [];
  for(let i=0; i<sentence.length; i++)
  {
    if ((sentence[i]>='a' && sentence[i]<='z') && !arr.includes(sentence[i])) 
    {
      arr.push(sentence[i])
    }
  }
  return arr.length === 26;
}
