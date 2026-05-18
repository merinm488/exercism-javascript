//
// This is only a SKELETON file for the 'Strain' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const keep = (list, fn) => {
  let result = [];
  for(let item of list)
  {
    if (fn(item))
      result.push(item)
  }
  return result;
};

export const discard = (list,fn) => {
  let result = [];
  for(let item of list)
  {
    if (!fn(item))
      result.push(item)
  }
  return result;
};
