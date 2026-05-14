//
// This is only a SKELETON file for the 'Proverb' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const proverb = (...args) => {
  let result = "";
  if (args.length == 0) return '';
  if (args.length==1) return `And all for the want of a ${args[0]}.`

  let hasQualifier = typeof args.at(-1) === 'object';
  let len = hasQualifier ?  args.length-2 : args.length-1;

  for (let i=0; i<len; i++)
  {
    result += `For want of a ${args[i]} the ${args[i+1]} was lost.`+'\n';
  }

  let qualifier = hasQualifier ? `${args.at(-1)['qualifier']} ${args[0]}` : args[0] ;
  result += `And all for the want of a ${qualifier}.`

  return result;
};
