//
// This is only a SKELETON file for the 'Flatten Array' exercise. It's been provided as a
// convenience to get you started writing code faster.
//


export const flatten = (nestedArray) => {
  let result = [];
  for (let item of nestedArray)
  {
    if(Array.isArray(item))
    {
      result = [...result,...flatten(item)]
    }
    else 
    {
      if (item !== null && item!==undefined)
      result.push(item);
    }
  }
  return result;
};
