//
// This is only a SKELETON file for the 'Acronym' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const parse = (input) => {
  const cleanInput = input.replace(/[^a-zA-Z- ]/g, '');
  const inputSplit = cleanInput.split(/[ -]/);
  let acronym = '';
  for (let item of inputSplit)
  {
    if(item)
    acronym = acronym+item[0]
  }
  return acronym.toUpperCase()
};
